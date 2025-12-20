// ===========================================
// src/app/api/validate-reset-token/route.ts
// ===========================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!resetRecord) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  return NextResponse.json({ valid: true });
}
// ===========================================  
// FIM de src/app/api/validate-reset-token/route.ts  
// ===========================================
