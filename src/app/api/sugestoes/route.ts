/* =============================================================================
 * ARQUIVO: src/app/api/sugestoes/route.ts
 * DESCRIÇÃO: Versão final com:
 * 1. Análise de frequência normalizada (peso relativo)
 * 2. Decaimento exponencial por idade do concurso
 * 3. Algoritmo Genético completo (elitismo, torneio, crossover, mutação)
 * 4. Bônus progressivo de cobertura
 * ============================================================================= */

import { NextRequest, NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";

export const dynamic = "force-dynamic";

// =============================================================================
// CONSTANTES
// =============================================================================
const CUSTO_POR_APOSTA          = 3.5;
const NUMERO_DE_JOGOS_NO_GRUPO  = 5;
const GAME_SIZE                 = 15;
const PRIZE_TABLE: Record<string, number> = { "13": 30, "12": 12, "11": 6 };
const DEZENAS_UNIVERSO          = Array.from({ length: 25 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);

// AG
const POPULATION_SIZE = 50;
const MUTATION_RATE   = 0.8;
const CROSSOVER_RATE  = 0.9;
const TOURNAMENT_SIZE = 3;
const TIMEOUT         = 29500;

// Fitness
const BONUS_POR_DEZENA_COBERTA = 25;
const META_COBERTURA_ALTA      = 24;
const BONUS_COBERTURA_ALTA     = 1000;

type IndividuoComScore = { grupo: string[][]; score: number };

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/** Cria lista de dezenas já com peso relativo + decaimento temporal */
function criarListaPonderada(
  concursosFormatados: { dezenas: string[] }[]
): string[] {
  const frequencia: Record<string, number> = {};
  concursosFormatados.forEach((c, idx) => {
    const peso = Math.pow(0.9, idx); // decaimento exponencial
    c.dezenas.forEach((d) => {
      frequencia[d] = (frequencia[d] || 0) + peso;
    });
  });

  const total = Object.values(frequencia).reduce((s, v) => s + v, 0);

  const lista: string[] = [];
  for (const d of DEZENAS_UNIVERSO) {
    const copias = Math.max(
      1,
      Math.round(((frequencia[d] || 0) / total) * 1000)
    );
    for (let i = 0; i < copias; i++) lista.push(d);
  }
  return lista;
}

/** Cria um jogo único a partir da lista ponderada */
function criarJogoUnico(dezenasPonderadas: string[]): string[] {
  const jogo = new Set<string>();
  while (jogo.size < GAME_SIZE) {
    jogo.add(
      dezenasPonderadas[Math.floor(Math.random() * dezenasPonderadas.length)]
    );
  }
  return Array.from(jogo).sort((a, b) => +a - +b);
}

/** Cria um grupo de 5 jogos únicos */
function criarGrupoUnico(dezenasPonderadas: string[]): string[][] {
  const grupo = new Set<string>();
  while (grupo.size < NUMERO_DE_JOGOS_NO_GRUPO) {
    grupo.add(JSON.stringify(criarJogoUnico(dezenasPonderadas)));
  }
  return Array.from(grupo).map((j) => JSON.parse(j));
}

/** Mutação simples: troca 1 jogo */
function mutacao(
  grupo: string[][],
  dezenasPonderadas: string[]
): string[][] {
  if (Math.random() > MUTATION_RATE) return grupo;
  const novo = grupo.map((j) => [...j]);
  const idx = Math.floor(Math.random() * NUMERO_DE_JOGOS_NO_GRUPO);
  novo[idx] = criarJogoUnico(dezenasPonderadas);
  return novo;
}

/** Crossover 1-ponto entre dois grupos */
function crossover(p1: string[][], p2: string[][]): string[][] {
  const corte = Math.floor(Math.random() * NUMERO_DE_JOGOS_NO_GRUPO);
  const filho = [];
  for (let i = 0; i < NUMERO_DE_JOGOS_NO_GRUPO; i++) {
    filho.push(i < corte ? [...p1[i]] : [...p2[i]]);
  }
  return filho;
}

/** Seleção por torneio */
function selecao(pop: IndividuoComScore[]): string[][] {
  const torneio: IndividuoComScore[] = [];
  for (let i = 0; i < TOURNAMENT_SIZE; i++) {
    torneio.push(pop[Math.floor(Math.random() * pop.length)]);
  }
  return torneio.reduce((m, c) => (c.score > m.score ? c : m)).grupo;
}

/** Cálculo do fitness */
function fitness(
  grupo: string[][],
  concursos: { dezenas: string[] }[],
  custo: number
): number {
  let lucro = 0;
  concursos.forEach((c) => {
    let maxPremio = 0;
    grupo.forEach((j) => {
      const acertos = j.filter((d) => c.dezenas.includes(d)).length;
      if (acertos >= 11 && acertos <= 11) {
        maxPremio = Math.max(maxPremio, PRIZE_TABLE[acertos.toString()] || 0);
      }
    });
    lucro += maxPremio;
  });

  const base = lucro - custo;
  const dezenasCobertas = new Set(grupo.flat()).size;
  const bonus =
    dezenasCobertas * BONUS_POR_DEZENA_COBERTA +
    (dezenasCobertas >= META_COBERTURA_ALTA ? BONUS_COBERTURA_ALTA : 0);

  return base + bonus;
}

// =============================================================================
// HANDLER POST
// =============================================================================
export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const { numConcursos = 24, grupoInicial } = body;

    if (![3, 6, 12, 18, 24].includes(numConcursos)) {
      return NextResponse.json(
        { error: "Número de concursos inválido. Use 3, 6, 12, 18 ou 24." },
        { status: 400 }
      );
    }

    const concursosDB = await loteriaPrisma.loto.findMany({
      orderBy: { concurso: "desc" },
      take: numConcursos,
    });

    if (concursosDB.length < numConcursos) {
      return NextResponse.json(
        {
          error: `Não foram encontrados ${numConcursos} concursos para análise.`,
        },
        { status: 400 }
      );
    }

    const concursosFmt = concursosDB.map((c) => ({
      dezenas: c.dezenas.split(",").map((d) => d.trim().padStart(2, "0")),
    }));

    const dezenasPonderadas = criarListaPonderada(concursosFmt);
    const custoTotal = concursosFmt.length * CUSTO_POR_APOSTA * NUMERO_DE_JOGOS_NO_GRUPO;

    // População inicial
    let populacao: string[][][] = [];
    if (
      grupoInicial &&
      Array.isArray(grupoInicial) &&
      grupoInicial.length === NUMERO_DE_JOGOS_NO_GRUPO
    ) {
      populacao = [grupoInicial];
      for (let i = 1; i < POPULATION_SIZE; i++) {
        populacao.push(mutacao(grupoInicial, dezenasPonderadas));
      }
    } else {
      populacao = Array.from({ length: POPULATION_SIZE }, () =>
        criarGrupoUnico(dezenasPonderadas)
      );
    }

    let melhorGlobal: IndividuoComScore = {
      grupo: [],
      score: -Infinity,
    };
    let geracao = 0;

    while (Date.now() - start < TIMEOUT) {
      geracao++;

      // Avaliação
      const popComScore: IndividuoComScore[] = populacao.map((g) => ({
        grupo: g,
        score: fitness(g, concursosFmt, custoTotal),
      }));
      popComScore.sort((a, b) => b.score - a.score);

      // Atualiza melhor global
      if (popComScore[0].score > melhorGlobal.score) {
        melhorGlobal = popComScore[0];
      }

      // Nova geração (elitismo + torneio + crossover/mutação)
      const nova: string[][][] = [melhorGlobal.grupo];
      while (nova.length < POPULATION_SIZE) {
        const p1 = selecao(popComScore);
        const p2 = selecao(popComScore);
        const filho =
          Math.random() < CROSSOVER_RATE
            ? crossover(p1, p2)
            : p1.map((j) => [...j]);
        nova.push(mutacao(filho, dezenasPonderadas));
      }
      populacao = nova;
    }

    const cobertura = new Set(melhorGlobal.grupo.flat()).size;
    const bonusCobertura =
      cobertura * BONUS_POR_DEZENA_COBERTA +
      (cobertura >= META_COBERTURA_ALTA ? BONUS_COBERTURA_ALTA : 0);
    const retornoReal = melhorGlobal.score - bonusCobertura;
    const premioTotal = retornoReal + custoTotal;

    const sugestoes = melhorGlobal.grupo.map((jogo, idx) => ({
      rank: idx + 1,
      dezenas: jogo,
    }));

    return NextResponse.json({
      sugestoes,
      desempenhoGrupo: {
        premioTotal,
        custoTotal,
        retorno: retornoReal,
      },
      concursosAnalisados: concursosFmt.length,
      periodo: numConcursos,
    });
  } catch (err: any) {
    console.error("Erro na API de sugestões:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor.", detalhe: err.message },
      { status: 500 }
    );
  }
}