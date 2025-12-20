// src/app/api/analise/route.ts
import { NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";

export async function GET() {
  // 1) Puxa todos os concursos ordenados do mais novo para o mais antigo
  const resultados = await loteriaPrisma.loto.findMany({
    orderBy: { concurso: "desc" },
    select: { dezenas: true },
  });

  // 2) Conta frequência de cada dezena
  const freqMap = new Map<number, number>();
  resultados.forEach(r =>
    r.dezenas.split(",").forEach(d => {
      const n = parseInt(d, 10);
      freqMap.set(n, (freqMap.get(n) || 0) + 1);
    })
  );
  const maisFrequentes = Array.from(freqMap.entries())
    .map(([numero, contador]) => ({ numero, contador }))
    .sort((a, b) => b.contador - a.contador);

  // 3) Calcula atraso (índice da primeira vez que apareceu)
  const lastSeenIndex = new Map<number, number>();
  for (let i = 0; i < resultados.length; i++) {
    resultados[i].dezenas.split(",").forEach(d => {
      const n = parseInt(d, 10);
      // só registra a primeira vez (mais recente)
      if (!lastSeenIndex.has(n)) {
        lastSeenIndex.set(n, i);
      }
    });
  }
  // Se alguma dezena nunca apareceu (improvável), considera atraso = total
  for (let n = 1; n <= 25; n++) {
    if (!lastSeenIndex.has(n)) {
      lastSeenIndex.set(n, resultados.length);
    }
  }
  const maioresAtrasos = Array.from(lastSeenIndex.entries())
    .map(([numero, contador]) => ({ numero, contador }))
    .sort((a, b) => b.contador - a.contador);

  return NextResponse.json({ maisFrequentes, maioresAtrasos });
}
