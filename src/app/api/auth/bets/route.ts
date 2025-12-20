// src/app/api/auth/bets/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Pega o cookieStore de forma assíncrona
    const cookieStore = await cookies();

    // 2️⃣ Extrai o token
    const token = cookieStore.get("token")?.value ?? null;

    // 3️⃣ Busca o usuário
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // 4️⃣ Busca as bets (pode ser zero)
    const bets = await prisma.bet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        concurso: true,
        dezenas: true,
        createdAt: true,
      },
    });

    // 5️⃣ Retorna sempre um array (vazio se não tiver apostas)
    return NextResponse.json(bets);
  } catch (err) {
    console.error("Erro em /api/auth/bets:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar histórico" },
      { status: 500 }
    );
  }
}
