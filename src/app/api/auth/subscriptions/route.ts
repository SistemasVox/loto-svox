// src/app/api/auth/subscriptions/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/auth/subscriptions
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const subs = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plano: true,
      status: true,
      startedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(subs);
}

// POST /api/auth/subscriptions
// body: { plano: Plano, expiresAt: string (ISO) }
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { plano, expiresAt } = await request.json();
  if (!plano || !expiresAt) {
    return NextResponse.json(
      { error: "Dados incompletos: plano e expiresAt obrigatórios" },
      { status: 400 }
    );
  }

  // procura assinatura existente do usuário
  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  let sub;
  if (existing) {
    // atualiza a assinatura existente
    sub = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plano,
        expiresAt: new Date(expiresAt),
        status: "ACTIVE",
      },
    });
  } else {
    // cria nova assinatura
    sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        plano,
        status: "ACTIVE",
        expiresAt: new Date(expiresAt),
      },
    });
  }

  return NextResponse.json(sub);
}
