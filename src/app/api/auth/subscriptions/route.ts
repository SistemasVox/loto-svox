// src/app/api/auth/subscriptions/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Mantém-se igual para listar o histórico de assinaturas
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const subs = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subs);
}

// POST: Regista o pedido de upgrade/downgrade para aprovação
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { plano } = await request.json();
  if (!plano) return NextResponse.json({ error: "Plano é obrigatório" }, { status: 400 });

  // Regista o pedido no modelo User para o Admin visualizar
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plano_solicitado: plano,
      data_solicitacao: new Date(),
    },
  });

  return NextResponse.json({ 
    msg: "Solicitação enviada. Aguarde a aprovação do administrador." 
  });
}