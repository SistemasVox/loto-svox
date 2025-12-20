// src/app/api/auth/verify-email/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token não informado" }, { status: 400 });
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { email: record.newEmail },
  });
  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  return NextResponse.redirect(new URL("/minha-conta?verified=1", request.url));
}
