import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function GET() {
  if (!(await checkAdminAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const users = await prisma.user.findMany({
    include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { id: 'asc' }
  });
  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  if (!(await checkAdminAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { userId, novoPlano } = await req.json();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await prisma.subscription.upsert({
    where: { id: (await prisma.subscription.findFirst({ where: { userId } }))?.id || 0 },
    update: { plano: novoPlano, expiresAt, status: "ACTIVE" },
    create: { userId, plano: novoPlano, expiresAt, status: "ACTIVE" }
  });
  return NextResponse.json({ success: true });
}