/* =============================================================================
 * ARQUIVO: src/app/api/loto/atualizar/route.ts
 * FIX: Adicionada a chave 'mensagem' para evitar 'undefined' no frontend.
 * ============================================================================= */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

const LOTE_TAMANHO = 20;
const CAIXA_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/";
const CABECALHOS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
  "Referer": "https://loterias.caixa.gov.br/"
};

// Helper para normalizar data (DD/MM/YYYY -> YYYY-MM-DD)
function normalizeDate(rawDate: string | null): string | null {
  if (!rawDate) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  if (rawDate.includes('/')) {
    const parts = rawDate.split('/');
    if (parts.length === 3) {
      const [dia, mes, ano] = parts;
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  return rawDate;
}

export async function POST() {
  try {
    const administrador = await checkAdminAccess();
    if (!administrador) return NextResponse.json({ error: "403" }, { status: 403 });

    const respostaCaixa = await fetch(CAIXA_URL, { headers: CABECALHOS, cache: 'no-store' });
    if (!respostaCaixa.ok) throw new Error(`Caixa offline: ${respostaCaixa.status}`);
    
    const metaDados = await respostaCaixa.json();
    const ultimoConcursoCaixa = metaDados.numero;

    const ultimoNoBanco = await prisma.loto.findFirst({ orderBy: { concurso: 'desc' } });
    const inicioProcessamento = (ultimoNoBanco?.concurso || 0) + 1;

    if (inicioProcessamento > ultimoConcursoCaixa) {
      return NextResponse.json({ 
        ok: true, 
        inseridos: 0, 
        mensagem: "Banco já está atualizado." // Chave crucial adicionada [cite: 2025-12-14]
      });
    }

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
            data_concurso: normalizeDate(d.dataApuracao),
            dezenas: d.listaDezenas.map((n: string) => n.padStart(2, '0')).sort().join(",")
          });
        }
      } catch (err) {
        continue;
      }
    }

    if (listaNovosJogos.length > 0) {
      await prisma.$transaction(
        listaNovosJogos.map((jogo) =>
          prisma.loto.upsert({
            where: { concurso: jogo.concurso },
            update: { data_concurso: jogo.data_concurso, dezenas: jogo.dezenas },
            create: jogo,
          })
        )
      );
    }

    // RETORNO CORRIGIDO: Agora inclui a string 'mensagem' que o frontend espera
    return NextResponse.json({
      ok: true,
      inseridos: listaNovosJogos.length,
      faltantes: ultimoConcursoCaixa - (fimProcessamento - 1),
      mensagem: `${listaNovosJogos.length} novos concursos sincronizados.` 
    });

  } catch (erro: any) {
    console.error("[FATAL] Erro na sincronização:", erro.message);
    return NextResponse.json({ error: erro.message }, { status: 500 });
  }
}