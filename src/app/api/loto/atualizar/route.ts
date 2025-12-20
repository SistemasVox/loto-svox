// src/app/api/loto/atualizar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";
import { verificarAdmin } from "@/lib/auth"; // Assumindo utilitário de validação JWT

// Constantes para evitar Magic Numbers
const CAIXA_API_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/";
const BATCH_SIZE = 50; 

export async function POST(req: NextRequest) {
  try {
    // 1. Segurança: Validar Sessão Admin
    const isAdmin = await verificarAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // 2. Análise de Estado Atual
    const ultimoNoBanco = await loteriaPrisma.loto.findFirst({
      orderBy: { concurso: 'desc' },
      select: { concurso: true }
    });
    
    const inicioSync = (ultimoNoBanco?.concurso || 0) + 1;

    // 3. Busca meta-dados do último concurso disponível
    const resMetadata = await fetch(CAIXA_API_URL, { cache: 'no-store' });
    if (!resMetadata.ok) throw new Error("Falha ao conectar com API da Caixa");
    const metadata = await resMetadata.json();
    const ultimoNaCaixa = metadata.numero;

    if (inicioSync > ultimoNaCaixa) {
      return NextResponse.json({ ok: true, mensagem: "Base já está sincronizada" });
    }

    const novosConcursos = [];
    console.info(`[LOTO_SYNC] Iniciando sincronização do ${inicioSync} ao ${ultimoNaCaixa}`);

    // 4. Execução de Busca (Sequencial para evitar Rate Limit da Caixa)
    for (let i = inicioSync; i <= ultimoNaCaixa; i++) {
      try {
        const res = await fetch(`${CAIXA_API_URL}${i}`, { cache: 'no-store' });
        if (!res.ok) continue;
        
        const d = await res.json();
        
        // Formatação de data resiliente
        let dataFormatada = null;
        if (d.dataApuracao) {
          const [dia, mes, ano] = d.dataApuracao.split('/');
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }

        novosConcursos.push({
          concurso: i,
          data_concurso: dataFormatada,
          dezenas: d.listaDezenas ? d.listaDezenas.join(",") : ""
        });

        // Log de progresso a cada 20 registros
        if (i % 20 === 0) console.debug(`[LOTO_SYNC] Processados ${i}/${ultimoNaCaixa}`);
        
      } catch (err) {
        console.warn(`[LOTO_SYNC] Falha ao buscar concurso ${i}, pulando...`);
        continue;
      }
    }

    // 5. Persistência em Lote (Atomicity)
    if (novosConcursos.length > 0) {
      await loteriaPrisma.loto.createMany({
        data: novosConcursos,
        skipDuplicates: true
      });
    }

    return NextResponse.json({ 
      ok: true, 
      inseridos: novosConcursos.length,
      mensagem: `Sincronização concluída: ${novosConcursos.length} novos registros`
    });

  } catch (error: any) {
    console.error("[CRITICAL] Erro na rota de atualização:", error.message);
    return NextResponse.json({ 
      ok: false, 
      error: "Falha interna durante a sincronização" 
    }, { status: 500 });
  }
}