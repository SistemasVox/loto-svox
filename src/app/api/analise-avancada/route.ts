// src/app/api/analise-avancada/route.ts
import { NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export async function GET() {
  // buscamos todos os concursos, em ordem crescente
  const rows = await loteriaPrisma.loto.findMany({
    orderBy: { concurso: "asc" },
    select: { concurso: true, dezenas: true },
  });

  const parsed = rows.map(r => ({
    concurso: r.concurso,
    dezenas: r.dezenas.split(",").map(d => parseInt(d, 10)),
  }));

  if (parsed.length === 0) {
    return NextResponse.json({ error: "Nenhum dado encontrado" }, { status: 404 });
  }

  const last = parsed[parsed.length - 1];
  const prev = parsed[parsed.length - 2] || { dezenas: [] };
  const isLastPrime = isPrime(last.concurso);

  // helper: contar aparições em um conjunto de concursos
  function countIn(contests: typeof parsed) {
    const cnt: Record<number, number> = {};
    contests.forEach(c => c.dezenas.forEach(d => cnt[d] = (cnt[d] || 0) + 1));
    return cnt;
  }

  // geral / par / ímpar / primos (se aplicável)
  const geralCounts = countIn(parsed);
  const parCounts = countIn(parsed.filter(c => c.concurso % 2 === 0));
  const imparCounts = countIn(parsed.filter(c => c.concurso % 2 !== 0));
  const primoCounts = isLastPrime
    ? countIn(parsed.filter(c => isPrime(c.concurso)))
    : null;

  // faixas 1–8 / 9–16 / 17–25
  const faixaDefs = [
    { faixa: "1–8",   min: 1,  max: 8 },
    { faixa: "9–16",  min: 9,  max: 16 },
    { faixa: "17–25", min: 17, max: 25 },
  ];
  const faixas = faixaDefs.map(f => {
    let total = 0;
    parsed.forEach(c =>
      c.dezenas.forEach(d => {
        if (d >= f.min && d <= f.max) total++;
      })
    );
    return { faixa: f.faixa, aparicoes: total };
  });

  // consecutivos: pares e trincas
  const pairCounts: Record<string, number> = {};
  const tripleCounts: Record<string, number> = {};
  parsed.forEach(c => {
    const d = [...c.dezenas].sort((a, b) => a - b);
    for (let i = 0; i + 1 < d.length; i++) {
      const key = `${d[i]}-${d[i+1]}`;
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    }
    for (let i = 0; i + 2 < d.length; i++) {
      const key = `${d[i]}-${d[i+1]}-${d[i+2]}`;
      tripleCounts[key] = (tripleCounts[key] || 0) + 1;
    }
  });

  // somas: média e top 5
  const sums = parsed.map(c => ({
    concurso: c.concurso,
    sum: c.dezenas.reduce((a, b) => a + b, 0),
  }));
  const averageSum = sums.reduce((a, b) => a + b.sum, 0) / sums.length;
  const top5Sums = [...sums]
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 5);

  // distribuição alta/baixa (1–12 vs 13–25)
  let baixa = 0, alta = 0;
  parsed.forEach(c =>
    c.dezenas.forEach(d => {
      if (d <= 12) baixa++;
      else alta++;
    })
  );
  const distrib = [
    { faixa: "Baixa (1–12)", aparicoes: baixa },
    { faixa: "Alta  (13–25)", aparicoes: alta },
  ];

  // repetidos entre último e penúltimo
  const repetidos = last.dezenas.filter(d => prev.dezenas.includes(d));

  return NextResponse.json({
    geral: geralCounts,
    par: parCounts,
    impar: imparCounts,
    primos: primoCounts,
    faixas,
    consecutivos: {
      pares: Object.entries(pairCounts).map(([par, aparicoes]) => ({ par, aparicoes })),
      trincas: Object.entries(tripleCounts).map(([tri, aparicoes]) => ({ tri, aparicoes })),
    },
    soma: { average: averageSum, top5: top5Sums },
    distribuicao: distrib,
    repetidos: { numeros: repetidos, count: repetidos.length },
  });
}
