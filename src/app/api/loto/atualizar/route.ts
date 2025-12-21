import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

// --- CONSTANTES TÉCNICAS (H6: RESILIÊNCIA) ---
const LOTE_TAMANHO = 20;
const CAIXA_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/";
const CABECALHOS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
  "Referer": "https://loterias.caixa.gov.br/"
};

export async function POST() {
  try {
    const administrador = await checkAdminAccess();
    if (!administrador) return NextResponse.json({ error: "403" }, { status: 403 });

    // 1. Obter meta-dados da Caixa
    const respostaCaixa = await fetch(CAIXA_URL, { headers: CABECALHOS, cache: 'no-store' });
    if (!respostaCaixa.ok) throw new Error(`Caixa offline: ${respostaCaixa.status}`);
    
    const metaDados = await respostaCaixa.json();
    const ultimoConcursoCaixa = metaDados.numero;

    // 2. Estado do banco unificado (dev.db)
    const ultimoNoBanco = await prisma.loto.findFirst({ orderBy: { concurso: 'desc' } });
    const inicioProcessamento = (ultimoNoBanco?.concurso || 0) + 1;

    if (inicioProcessamento > ultimoConcursoCaixa) {
      return NextResponse.json({ ok: true, inseridos: 0, faltantes: 0 });
    }

    // 3. Coleta de dados por lote
    const fimProcessamento = Math.min(inicioProcessamento + LOTE_TAMANHO, ultimoConcursoCaixa + 1);
    const listaNovosJogos = [];

    for (let i = inicioProcessamento; i < fimProcessamento; i++) {
      try {
        const r = await fetch(`${CAIXA_URL}${i}`, { headers: CABECALHOS });
        if (!r.ok) continue;
        const d = await r.json();
        
        if (d?.listaDezenas) {
          listaNovosJogos.push({
            concurso: i,
            data_concurso: d.dataApuracao || null,
            dezenas: d.listaDezenas.map((n: string) => n.padStart(2, '0')).sort().join(",")
          });
        }
      } catch (err) {
        console.warn(`[SYNC] Falha ao baixar concurso ${i}`);
        continue;
      }
    }

    // 4. PERSISTÊNCIA COMPATÍVEL COM SQLITE (RESOLUÇÃO DO ERRO 500)
    // Substituímos createMany por um loop de upsert dentro de transação
    if (listaNovosJogos.length > 0) {
      await prisma.$transaction(
        listaNovosJogos.map((jogo) =>
          prisma.loto.upsert({
            where: { concurso: jogo.concurso },
            update: {}, // Não altera se já existir
            create: jogo,
          })
        )
      );
    }

    return NextResponse.json({
      ok: true,
      inseridos: listaNovosJogos.length,
      faltantes: ultimoConcursoCaixa - (fimProcessamento - 1)
    });

  } catch (erro: any) {
    console.error("[FATAL] Erro na sincronização:", erro.message);
    return NextResponse.json({ error: erro.message }, { status: 500 });
  }
}