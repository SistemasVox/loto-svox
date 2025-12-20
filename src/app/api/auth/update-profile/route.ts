// src/app/api/auth/update-profile/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { updateUserProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    // 1️⃣ lê name e email do body
    const { name, email } = await request.json();

    // 2️⃣ pega o cookieStore assincronamente
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;

    // 3️⃣ tenta atualizar via lib/auth
    const updatedUser = await updateUserProfile(token, { name, email });

    // 4️⃣ retorna usuário atualizado
    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err: any) {
    console.error("Error in /api/auth/update-profile:", err);

    // 5️⃣ se o erro for de e-mail duplicado, responde mensagem genérica
    if (err.message === "Este email já está em uso.") {
      return NextResponse.json(
        { error: "E-mail não disponível." },
        { status: 409 }
      );
    }

    // 6️⃣ para outros erros, retorna mensagem do err ou genérica
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar perfil." },
      { status: 400 }
    );
  }
}
