// src/app/api/auth/notifications/[id]/read/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PUT /api/auth/notifications/:id/read
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = new URL(request.url);
  const idStr = url.pathname.split("/").slice(-2, -1)[0];
  const noteId = parseInt(idStr, 10);
  if (isNaN(noteId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const updated = await prisma.notification.updateMany({
    where: { id: noteId, userId: user.id },
    data: { isRead: true },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
