// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const [totalBets, sub] = await Promise.all([
    prisma.bet.count({ where: { userId: user.id } }),
    prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  ]);
  const unreadNotifications = await prisma.notification.count({
    where: { userId: user.id, isRead: false }
  });

  return NextResponse.json({
    totalBets,
    activePlan: sub?.plano || 'FREE',
    unreadNotifications
  });
}
