// src/app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// ======================================================
// Variável global de log (DEBUG)
// ======================================================
// Pode controlar via .env: DEBUG=true ou false
const DEBUG = process.env.DEBUG === "true";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Debug: valor cru de ADMIN_EMAILS
    if (DEBUG) {
      console.log("[ADMIN_EMAILS raw]", process.env.ADMIN_EMAILS);
    }

    // 2️⃣ Pega o token armazenado no cookie `token`
    const sessionToken = request.cookies.get("token")?.value ?? null;

    // 3️⃣ Busca o usuário no backend
    const user = await getCurrentUser(sessionToken);

    // 4️⃣ Normaliza e separa a lista de admins
    const adminList = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS
          .split(",")
          .map((e) => e.trim().toLowerCase())
      : [];
    if (DEBUG) {
      console.log("[adminList]", adminList);
    }

    // 5️⃣ Determina o role apenas se existir user.email
    let role: "admin" | "user" | undefined = undefined;
    if (user?.email) {
      const emailNorm = user.email.trim().toLowerCase();
      role = adminList.includes(emailNorm) ? "admin" : "user";
      (user as any).role = role;
    }

    // 6️⃣ Debug final pra ver o que vai retornar
    if (DEBUG) {
      console.log("[session]", { email: user?.email, role });
    }

    // 7️⃣ Retorna a sessão
    return NextResponse.json({ user: user ?? null });
  } catch (err) {
    // Erro sempre no console
    console.error("Error in /api/auth/session:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
