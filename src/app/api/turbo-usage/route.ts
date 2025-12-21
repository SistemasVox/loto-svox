/* =============================================================================
 * ARQUIVO: src/app/api/turbo-usage/route.ts
 * FINALIDADE: Controle de uso diário do Turbo por usuário e plano (Anti-Bug de Tipo).
 * STATUS: Corrigido (Cast String -> Int para SQLite).
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

    // --- CORREÇÃO TÉCNICA: Conversão obrigatória para Int (SQLite) ---
    const userIdInt = parseInt(String(user.id), 10);

    // Busca plano ativo
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userIdInt, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    
    const userPlan = (subscription?.plano as keyof typeof TURBO_LIMITS) || "FREE";
    const limite = TURBO_LIMITS[userPlan];

    // Verifica uso hoje usando o ID numérico
    const today = new Date().toISOString().split("T")[0];
    const usage = await prisma.turboUsage.findUnique({
      where: {
        userId_date_tab: {
          userId: userIdInt, // Corrigido: Removido String()
          date: today,
          tab: String(tab),
        },
      },
    });

    return NextResponse.json({
      usos: usage?.usos || 0,
      limite,
      podeUsar: (usage?.usos || 0) < limite,
    });
  } catch (err: any) {
    console.error("[CRITICAL] Erro no GET turbo-usage:", err.message);
    return NextResponse.json({ error: "Erro interno ao checar Turbo" }, { status: 500 });
  }
}

/* =============================================================================
 * HANDLER: POST - Incrementa uso do Turbo
 * ============================================================================= */
export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value ?? null;
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { tab } = await request.json();
    if (!tab) {
      return NextResponse.json({ error: "Tab não especificada" }, { status: 400 });
    }

    // --- CORREÇÃO TÉCNICA: Conversão obrigatória para Int (SQLite) ---
    const userIdInt = parseInt(String(user.id), 10);

    const subscription = await prisma.subscription.findFirst({
      where: { userId: userIdInt, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    
    const userPlan = (subscription?.plano as keyof typeof TURBO_LIMITS) || "FREE";
    const limite = TURBO_LIMITS[userPlan];

    const today = new Date().toISOString().split("T")[0];
    
    // UPSERT: Sincronização atômica de uso
    const usage = await prisma.turboUsage.upsert({
      where: {
        userId_date_tab: {
          userId: userIdInt, // Corrigido: Tipo Int
          date: today,
          tab: String(tab),
        },
      },
      update: { 
        usos: { increment: 1 } 
      },
      create: { 
        userId: userIdInt, 
        date: today, 
        tab: String(tab), 
        usos: 1 
      },
    });

    if (usage.usos > limite) {
      return NextResponse.json({ error: "Limite diário atingido" }, { status: 429 });
    }

    return NextResponse.json({
      sucesso: true,
      usos: usage.usos,
      limite,
    });
  } catch (err: any) {
    console.error("[CRITICAL] Erro no POST turbo-usage:", err.message);
    return NextResponse.json({ error: "Erro ao registrar Turbo" }, { status: 500 });
  }
}