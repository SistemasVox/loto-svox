// ===========================================
// src/app/api/reset-password/route.ts
// ===========================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    if (typeof token !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Hash do token recebido para comparar com DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Busca token válido
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord || !resetRecord.user) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    const userId = resetRecord.userId;

    // Atualiza senha do usuário
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    // Marca token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro /api/reset-password:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
// ===========================================  
// FIM de src/app/api/reset-password/route.ts  
// ===========================================
