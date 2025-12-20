/**
 * ROTA: Gerenciamento de Usuários
 * DESCRIÇÃO: Listagem e atualização de planos (admin apenas)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function GET() {
  const administrador = await checkAdminAccess();
  if (!administrador) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

  try {
    const usuarios = await prisma.user.findMany({
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(usuarios);
  } catch (erro) {
    console.error("[ERRO_GET_USERS]", erro);
    return NextResponse.json({ erro: "Falha interna" }, { status: 500 });
  }
}

export async function PATCH(requisicao: Request) {
  const administrador = await checkAdminAccess();
  if (!administrador) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

  try {
    const corpo = await requisicao.json();
    const { userId, novoPlano } = corpo;

    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 1);

    await prisma.subscription.upsert({
      where: { 
        id: (await prisma.subscription.findFirst({ where: { userId } }))?.id || 0 
      },
      update: { plano: novoPlano, expiresAt: validade, status: "ACTIVE" },
      create: { userId, plano: novoPlano, expiresAt: validade, status: "ACTIVE" }
    });

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    return NextResponse.json({ erro: "Erro na atualização" }, { status: 500 });
  }
}