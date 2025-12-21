import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await checkAdminAccess();
    if (!admin) return NextResponse.json({ error: "403" }, { status: 403 });

    const solicitacoes = await prisma.user.findMany({
      where: {
        NOT: { plano_solicitado: null }
      },
      select: {
        id: true,
        email: true,
        plano_solicitado: true,
        data_solicitacao: true
      },
      orderBy: { data_solicitacao: 'desc' }
    });

    return NextResponse.json(solicitacoes);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
