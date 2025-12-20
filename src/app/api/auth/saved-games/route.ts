/* =============================================================================
 * ARQUIVO: src/app/api/auth/saved-games/route.ts
 * DESCRIÇÃO: Endpoints GET e POST para listar e criar apostas/jogos salvos
 *            agora salvando corretamente o campo `concurso`
 * ============================================================================= */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plano } from "@prisma/client";

export const dynamic = "force-dynamic";
const DEBUG = false;

/* =============================================================================
 * LIMITES POR PLANO
 * ============================================================================= */
const SAVED_GAMES_LIMITS: Record<Plano, number> = {
  FREE:   30,
  BASICO: 60,
  PLUS:   100,
  PREMIO: 300,
};

/* =============================================================================
 * POST /api/auth/saved-games
 * Cria nova aposta/jogo salvo, agora com `concurso` vindo do corpo
 * ============================================================================= */
export async function POST(request: NextRequest) {
  try {
    // 1) Autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;
    const user  = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2) Ler e validar números e concurso
    const { numbers, concurso } = await request.json();
    // validações
    if (
      !Array.isArray(numbers) ||
      numbers.length !== 15 ||
      !numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 25)
    ) {
      return NextResponse.json(
        { error: "numbers deve ser array de 15 inteiros entre 1 e 25." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(concurso) || concurso <= 0) {
      return NextResponse.json(
        { error: "concurso deve ser um inteiro positivo." },
        { status: 400 }
      );
    }
    if (DEBUG) console.log("[POST saved-games] numbers:", numbers, "concurso:", concurso);

    // 3) Determinar limite pelo plano
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    const userPlan = subscription?.plano || "FREE";
    const limit    = SAVED_GAMES_LIMITS[userPlan];

    // 4) Checar quantas apostas já existem
    const total = await prisma.bet.count({
      where: { userId: user.id },
    });
    if (total >= limit) {
      return NextResponse.json(
        { error: "Limite de jogos atingido", limit, current: total },
        { status: 403 }
      );
    }

    // 5) Criar aposta no banco
    const newBet = await prisma.bet.create({
      data: {
        userId:   user.id,
        concurso,                         // agora vem do body
        dezenas:  numbers.join(","),      // salva como CSV
      },
    });
    if (DEBUG) console.log("[POST saved-games] newBet:", newBet);

    // 6) Retornar aposta criada
    return NextResponse.json(
      {
        id:        newBet.id,
        concurso:  newBet.concurso,
        numbers:   newBet.dezenas.split(",").map(Number),
        createdAt: newBet.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro em POST /api/auth/saved-games:", err);
    return NextResponse.json(
      { error: "Erro interno ao salvar jogo" },
      { status: 500 }
    );
  }
}

/* =============================================================================
 * GET /api/auth/saved-games
 * Lista apostas/jogos salvos incluindo o concurso
 * ============================================================================= */
export async function GET(request: NextRequest) {
  try {
    // 1) Autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;
    const user  = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2) Buscar apostas (só por userId), agora seleciona também `concurso`
    const bets = await prisma.bet.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
      select:  { id: true, concurso: true, dezenas: true, createdAt: true },
    });
    if (DEBUG) console.log("[GET saved-games] bets:", bets);

    // 3) Calcular limite e restante
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    const userPlan  = subscription?.plano || "FREE";
    const limit     = SAVED_GAMES_LIMITS[userPlan];
    const remaining = limit - bets.length;

    // 4) Formatar resposta
    const games = bets.map((b) => ({
      id:        b.id,
      concurso:  b.concurso,
      numbers:   b.dezenas.split(",").map(Number),
      createdAt: b.createdAt,
    }));

    // 5) Retornar JSON
    return NextResponse.json({ games, limit, remaining });
  } catch (err) {
    console.error("Erro em GET /api/auth/saved-games:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar jogos salvos" },
      { status: 500 }
    );
  }
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
