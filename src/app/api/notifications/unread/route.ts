import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || null;
    const user = await getCurrentUser(token); // Validação via JWT

    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Busca apenas as que ainda não foram lidas pelo usuário
    const notificacoes = await prisma.notification.findMany({
      where: {
        userId: user.id,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar alertas" }, { status: 500 });
  }
}

// PATCH: Marca as notificações como lidas para não repetir o Toast
export async function PATCH(req: Request) {
  const { ids } = await req.json();
  await prisma.notification.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true }
  });
  return NextResponse.json({ success: true });
}