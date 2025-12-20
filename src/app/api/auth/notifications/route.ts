// src/app/api/auth/notifications/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const notes = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      link: true,
      isRead: true,
      createdAt: true,
    },
  });

  return NextResponse.json(notes);
}
