// ===========================================
// src/app/api/forgot-password/route.ts
// ===========================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Por segurança, não informamos que e-mail não existe; apenas retornamos ok
      return NextResponse.json({ ok: true });
    }

    // Gerar token aleatório
    const token = crypto.randomBytes(32).toString("hex"); // 64 caracteres hex
    // Hash do token para armazenar
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // Expiração: 1 hora à frente
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // Salvar token no DB
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        user: { connect: { id: user.id } },
        expiresAt,
      },
    });

    // Construir URL de reset; supondo rota /reset-password?token=...
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.url.replace(/\/api.*$/, "")}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Enviar e-mail (ou console.log)
    await sendResetPasswordEmail(user.email, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro /api/forgot-password:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
// ===========================================  
// FIM de src/app/api/forgot-password/route.ts  
// ===========================================
