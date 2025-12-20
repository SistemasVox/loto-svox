/* =============================================================================
 * ARQUIVO: src/app/api/turbo-usage/route.ts
 * FINALIDADE: Controle de uso diário do botão Turbo por usuário e plano.
 * BACKEND: Next.js App Router + Prisma (SEM NextAuth)
 * ============================================================================= */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =============================================================================
 * CONSTANTES: LIMITES DE USO TURBO POR PLANO
 * ============================================================================= */
const TURBO_LIMITS = {
  FREE: 1,
  BASICO: 2,
  PLUS: 2,
  PREMIO: 200,
};

/* =============================================================================
 * HANDLER: GET - Consulta quantas vezes o usuário usou o Turbo no dia
 * ============================================================================= */
export async function GET(request: NextRequest) {
  try {
    // =========================================================================
    // AUTENTICAÇÃO: Valida usuário via token nos cookies
    // =========================================================================
    const token = (await cookies()).get("token")?.value ?? null;
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // =========================================================================
    // OBTÉM A 'TAB' (nível/plano em que o Turbo foi solicitado)
    // =========================================================================
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab");
    if (!tab) {
      return NextResponse.json({ error: "Tab não especificada" }, { status: 400 });
    }

    // =========================================================================
    // BUSCA PLANO ATIVO E LIMITE DE USO
    // =========================================================================
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    const userPlan = subscription?.plano || "FREE";
    const limite = TURBO_LIMITS[userPlan];

    // =========================================================================
    // VERIFICA USO DO TURBO HOJE
    // =========================================================================
    const today = new Date().toISOString().split("T")[0];
    const usage = await prisma.turboUsage.findUnique({
      where: {
        userId_date_tab: {
          userId: String(user.id),
          date: today,
          tab: String(tab),
        },
      },
    });

    // =========================================================================
    // RETORNO DA API
    // =========================================================================
    return NextResponse.json({
      usos: usage?.usos || 0,
      limite,
      podeUsar: (usage?.usos || 0) < limite,
    });
  } catch (err) {
    // =========================================================================
    // ERRO INTERNO
    // =========================================================================
    return NextResponse.json({ error: "Erro interno ao checar Turbo" }, { status: 500 });
  }
}

/* =============================================================================
 * HANDLER: POST - Registra um novo uso do Turbo para o usuário/plano
 * ============================================================================= */
export async function POST(request: NextRequest) {
  try {
    // =========================================================================
    // AUTENTICAÇÃO: Valida usuário via token nos cookies
    // =========================================================================
    const token = (await cookies()).get("token")?.value ?? null;
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // =========================================================================
    // LÊ O NOME DA 'TAB' NO CORPO DA REQUISIÇÃO
    // =========================================================================
    const { tab } = await request.json();
    if (!tab) {
      return NextResponse.json({ error: "Tab não especificada" }, { status: 400 });
    }

    // =========================================================================
    // BUSCA PLANO ATIVO E LIMITE DE USO
    // =========================================================================
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    const userPlan = subscription?.plano || "FREE";
    const limite = TURBO_LIMITS[userPlan];

    // =========================================================================
    // VERIFICA E ATUALIZA USO DO TURBO
    // =========================================================================
    const today = new Date().toISOString().split("T")[0];
    let usage = await prisma.turboUsage.findUnique({
      where: {
        userId_date_tab: {
          userId: String(user.id),
          date: today,
          tab: String(tab),
        },
      },
    });

    if (usage && usage.usos >= limite) {
      return NextResponse.json({ error: "Limite diário do Turbo atingido" }, { status: 429 });
    }

    if (!usage) {
      usage = await prisma.turboUsage.create({
        data: { userId: String(user.id), date: today, tab: String(tab), usos: 1 },
      });
    } else {
      usage = await prisma.turboUsage.update({
        where: {
          userId_date_tab: {
            userId: String(user.id),
            date: today,
            tab: String(tab),
          },
        },
        data: { usos: { increment: 1 } },
      });
    }

    // =========================================================================
    // RETORNO DA API
    // =========================================================================
    return NextResponse.json({
      sucesso: true,
      usos: usage.usos,
      limite,
    });
  } catch (err) {
    // =========================================================================
    // ERRO INTERNO
    // =========================================================================
    return NextResponse.json({ error: "Erro interno ao registrar Turbo" }, { status: 500 });
  }
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
