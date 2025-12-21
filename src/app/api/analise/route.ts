// ======================================================================
// SISTEMA LOTO - MOTOR DE ANÁLISE ESTATÍSTICA (UNIFICADO)
// ======================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Importa o cliente unificado para evitar erro de módulo

export const dynamic = "force-dynamic"; // Garante execução em tempo real no Next.js 15

export async function GET() {
  try {
    // 1) Procura todos os concursos no banco unificado (Tabela Loto)
    const resultados = await prisma.loto.findMany({
      orderBy: { concurso: "desc" },
      select: { dezenas: true },
    });

    if (!resultados || resultados.length === 0) {
      return NextResponse.json({ maisFrequentes: [], maioresAtrasos: [] });
    }

    // 2) Conta frequência de cada dezena
    const freqMap = new Map<number, number>();
    resultados.forEach(r =>
      r.dezenas.split(",").forEach(d => {
        const n = parseInt(d.trim(), 10);
        if (!isNaN(n)) {
          freqMap.set(n, (freqMap.get(n) || 0) + 1);
        }
      })
    );

    const maisFrequentes = Array.from(freqMap.entries())
      .map(([numero, contador]) => ({ numero, contador }))
      .sort((a, b) => b.contador - a.contador);

    // 3) Calcula atraso (índice da primeira vez que apareceu no histórico)
    const lastSeenIndex = new Map<number, number>();
    for (let i = 0; i < resultados.length; i++) {
      resultados[i].dezenas.split(",").forEach(d => {
        const n = parseInt(d.trim(), 10);
        // Regista apenas a primeira ocorrência (a mais recente/topo da lista)
        if (!isNaN(n) && !lastSeenIndex.has(n)) {
          lastSeenIndex.set(n, i);
        }
      });
    }

    // Heurística: Se alguma dezena (1 a 25) não apareceu, considera o atraso máximo
    for (let n = 1; n <= 25; n++) {
      if (!lastSeenIndex.has(n)) {
        lastSeenIndex.set(n, resultados.length);
      }
    }

    const maioresAtrasos = Array.from(lastSeenIndex.entries())
      .map(([numero, contador]) => ({ numero, contador }))
      .sort((a, b) => b.contador - a.contador);

    return NextResponse.json({ maisFrequentes, maioresAtrasos });

  } catch (erro) {
    console.error("[CRITICAL] Falha no motor de análise:", erro);
    return NextResponse.json(
      { error: "Falha ao processar estatísticas." }, 
      { status: 500 }
    );
  }
}