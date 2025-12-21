import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await checkAdminAccess();
    if (!admin) return NextResponse.json({ error: "403" }, { status: 403 });

    const usuarios = await prisma.user.findMany({
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
