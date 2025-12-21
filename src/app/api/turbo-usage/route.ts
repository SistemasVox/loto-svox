/* =============================================================================
 * ARQUIVO: src/app/api/turbo-usage/route.ts
 * FINALIDADE: Controle de uso diário do Turbo com persistência atômica.
 * CORREÇÃO: Alinhamento de campos (usos -> count) para evitar erro de runtime.
 * ============================================================================= */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =============================================================================
 * CONSTANTES: LIMITES DE USO TURBO (ZERO MAGIC NUMBERS)
 * ============================================================================= */
const TURBO_LIMITS = {
  FREE: 1,
  BASICO: 2,
  PLUS: 2,
  PREMIO: 200,
};

/* =============================================================================
 * HANDLER: GET - Consulta uso diário
 * ============================================================================= */
export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value ?? null;
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab");
    
    if (!tab) {
      return NextResponse.json({ error: "Tab não especificada" }, { status: 400 });
    }

    // --- CONVERSÃO PARA INT (Obrigatório para SQLite/better-sqlite3) ---
    const userIdInt = parseInt(String(user.id), 10);

    // Busca plano ativo para determinar o limite operacional
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userIdInt, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    
    const userPlan = (subscription?.plano?.toUpperCase() as keyof typeof TURBO_LIMITS) || "FREE";
    const limite = TURBO_LIMITS[userPlan] || TURBO_LIMITS.FREE;

    const today = new Date().toISOString().split("T")[0];
    
    // Busca registro usando o campo correto: 'count'
    const usage = await prisma.turboUsage.findUnique({
      where: {
        userId_date_tab: {
          userId: userIdInt,
          date: today,
          tab: String(tab),
        },
      },
    });

    const currentUsos = usage?.count || 0;

    return NextResponse.json({
      usos: currentUsos,
      limite,
      podeUsar: currentUsos < limite,
    });

  } catch (err: any) {
    console.error("[CRITICAL] Erro no GET turbo-usage:", err.message);
    return NextResponse.json({ error: "Erro interno ao validar Turbo" }, { status: 500 });
  }
}

/* =============================================================================
 * HANDLER: POST - Incrementa uso do Turbo (UPSERT ATÔMICO)
 * ============================================================================= */
export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value ?? null;
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { tab } = body;

    if (!tab) {
      return NextResponse.json({ error: "Tab não especificada" }, { status: 400 });
    }

    const userIdInt = parseInt(String(user.id), 10);
    const today = new Date().toISOString().split("T")[0];

    // Busca limite antes de incrementar (Prevenção de race condition)
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userIdInt, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    const userPlan = (subscription?.plano?.toUpperCase() as keyof typeof TURBO_LIMITS) || "FREE";
    const limite = TURBO_LIMITS[userPlan] || TURBO_LIMITS.FREE;

    // UPSERT: Alinhado com o campo 'count' do Schema
    const usage = await prisma.turboUsage.upsert({
      where: {
        userId_date_tab: {
          userId: userIdInt,
          date: today,
          tab: String(tab),
        },
      },
      update: { 
        count: { increment: 1 } 
      },
      create: { 
        userId: userIdInt, 
        date: today, 
        tab: String(tab), 
        count: 1 
      },
    });

    // Validação de overflow de limite
    if (usage.count > limite) {
      return NextResponse.json({ error: "Limite diário excedido" }, { status: 429 });
    }

    return NextResponse.json({
      sucesso: true,
      usos: usage.count,
      limite,
    });

  } catch (err: any) {
    console.error("[CRITICAL] Erro no POST turbo-usage:", err.message);
    return NextResponse.json({ 
      error: "Falha ao registrar uso do Turbo",
      details: err.message 
    }, { status: 500 });
  }
}