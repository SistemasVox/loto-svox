// src/app/api/auth/bets/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE /api/auth/bets/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const betId = parseInt(params.id, 10);
  await prisma.bet.deleteMany({
    where: { id: betId, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}

// PUT /api/auth/bets/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const betId = parseInt(params.id, 10);
  const { concurso, dezenas } = await request.json();

  const result = await prisma.bet.updateMany({
    where: { id: betId, userId: user.id },
    data: { concurso, dezenas },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Aposta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
