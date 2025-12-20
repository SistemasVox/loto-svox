// src/app/api/auth/subscriptions/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  // 1️⃣ Autenticação
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2️⃣ Extrai o ID da URL (sem usar `params`)
  const url = new URL(request.url);
  const idStr = url.pathname.split("/").pop();
  const subId = idStr ? parseInt(idStr, 10) : NaN;
  if (isNaN(subId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // 3️⃣ Deleta apenas se for do próprio usuário
  const deleted = await prisma.subscription.deleteMany({
    where: { id: subId, userId: user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Assinatura não encontrada" },
      { status: 404 }
    );
  }

  // 4️⃣ Sucesso
  return NextResponse.json({ ok: true });
}
