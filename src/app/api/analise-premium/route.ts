/* =============================================================================
 * ARQUIVO: src/app/api/analise-premium/route.ts
 * DESCRIÇÃO: API para análise premium da Lotofácil, simulando jogos mais rentáveis
 * ============================================================================= */

import { NextRequest, NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";
import { verificarApiKey } from "@/lib/verificarApiKey";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRIZE_TABLE } from "@/lib/loteriaConfig"; // Importação centralizada

export const dynamic = "force-dynamic";

function contarFrequenciaDezenas(jogos: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  jogos.forEach(jogo => {
    jogo.split(",").forEach(dezena => {
      const d = dezena.trim().padStart(2, "0");
      freq[d] = (freq[d] || 0) + 1;
    });
  });
  return freq;
}

function melhoresCombinacoes(freq: Record<string, number>, qtdComb: number, tamJogo: number): string[][] {
  const dezenasOrdenadas = Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || parseInt(a[0]) - parseInt(b[0]))
    .map(([dezena]) => dezena);

  const jogos: string[][] = [];
  for (let i = 0; i < qtdComb; i++) {
    jogos.push(
      dezenasOrdenadas.slice(i, i + tamJogo)
        .map(d => d.padStart(2, "0"))
        .sort((a, b) => parseInt(a) - parseInt(b))
    );
  }
  return jogos;
}

function calcularAcertos(jogo: string[], concursos: { dezenas: string }[]): Record<string, number> {
  const resultado: Record<string, number> = { "11": 0, "12": 0, "13": 0, "14": 0, "15": 0 };
  concursos.forEach(concurso => {
    const sorteadas = concurso.dezenas.split(",").map(d => d.trim().padStart(2, "0"));
    const acertos = jogo.filter(dz => sorteadas.includes(dz)).length;
    if (acertos >= 11) resultado[acertos.toString()] += 1;
  });
  return resultado;
}

export async function POST(req: NextRequest) {
  try {
    let autorizado = false;
    
    const cookieHeader = req.headers.get("cookie");
    let token = null;
    let user = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies.token || null;
      user = token ? await getCurrentUser(token) : null;
    }
    
    if (user) {
      const sub = await prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      
      if (sub && sub.plano.toUpperCase() === "PREMIO") {
        autorizado = true;
      }
    }
    
    if (!autorizado) {
      const chaveValida = await verificarApiKey(req);
      if (!chaveValida.ok) {
        return NextResponse.json(
          { error: "Não autorizado", detalhe: "Usuário não premium ou API key inválida" },
          { status: 401 }
        );
      }
      autorizado = true;
    }

    const body = await req.json();
    
    // Modo Turbo (gera top jogos)
    if (body.modo === "turbo") {
      const quantidadeConcursos = body.quantidadeConcursos;
      const quantidade = Number(quantidadeConcursos) || 10;

      const concursos = await loteriaPrisma.loto.findMany({
        orderBy: { concurso: "desc" },
        take: quantidade,
        select: {
          concurso: true,
          data_concurso: true,
          dezenas: true,
        },
      });

      if (!concursos.length) {
        return NextResponse.json(
          { error: "Sem concursos encontrados" },
          { status: 404 }
        );
      }

      const todasDezenas = concursos.map(c => c.dezenas);
      const freq = contarFrequenciaDezenas(todasDezenas);

      const topComb = melhoresCombinacoes(freq, 10, 15);

      const melhoresJogos = topComb.map((jogo, idx) => {
        const acertos = calcularAcertos(jogo, concursos);
        let premio_total = 0;
        Object.entries(acertos).forEach(([acerto, qtde]) => {
          premio_total += (PRIZE_TABLE[acerto] || 0) * qtde;
        });
        return {
          rank: idx + 1,
          dezenas: [...jogo].sort((a, b) => parseInt(a) - parseInt(b)),
          acertos,
          premio_total,
        };
      });

      melhoresJogos.sort((a, b) => b.premio_total - a.premio_total);

      return NextResponse.json({
        ok: true,
        melhoresJogos,
        periodoAnalisado: concursos.map(c => ({
          concurso: c.concurso,
          data_concurso: c.data_concurso,
          dezenas: c.dezenas,
        })),
      });
    }
    // Modo Simulação (analisa jogo específico)
    else {
      const { concursoInicial, jogo: jogoUsuario, periodo } = body;

      if (!jogoUsuario) {
        return NextResponse.json(
          { error: "Parâmetro inválido", detalhe: "O parâmetro 'jogo' é obrigatório." },
          { status: 400 }
        );
      }
      if (periodo !== 'completo' && !concursoInicial) {
        return NextResponse.json(
          { error: "Parâmetro inválido", detalhe: "O 'concursoInicial' é obrigatório para este tipo de análise." },
          { status: 400 }
        );
      }

      const whereCondition: any = {};
      if (periodo !== 'completo') {
        whereCondition.concurso = { gt: concursoInicial };
      }
      
      const concursos = await loteriaPrisma.loto.findMany({
        where: whereCondition,
        orderBy: { concurso: "asc" },
        select: {
          concurso: true,
          data_concurso: true,
          dezenas: true,
        },
      });

      if (concursos.length === 0) {
        return NextResponse.json({
          ok: true,
          valorTotal: 0,
          periodoAnalisado: {
            inicio: concursoInicial,
            fim: concursoInicial,
            quantidade: 0
          },
        });
      }

      const jogoFormatado = jogoUsuario.map((n: number) => n.toString().padStart(2, "0"));
      
      const acertos = calcularAcertos(jogoFormatado, concursos);
      let valorTotal = 0;
      
      Object.entries(acertos).forEach(([acerto, qtde]) => {
        valorTotal += (PRIZE_TABLE[acerto] || 0) * qtde;
      });
      
      return NextResponse.json({
        ok: true,
        valorTotal,
        periodoAnalisado: {
          inicio: concursos[0].concurso,
          fim: concursos[concursos.length - 1].concurso,
          quantidade: concursos.length
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno na análise premium", detalhe: err?.message || err },
      { status: 500 }
    );
  }
}