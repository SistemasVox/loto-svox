// src/app/api/auth/change-password/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { changeUserPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "As senhas não conferem." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;

    await changeUserPassword(token, { currentPassword, newPassword });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error in /api/auth/change-password:", err);
    const msg = err.message || "Erro ao trocar senha.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
