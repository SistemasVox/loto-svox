// src/app/api/auth/upload-avatar/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false, // desativa o bodyParser do Next.js
  },
};

export async function POST(request: NextRequest) {
  // 1️⃣ Autenticação
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2️⃣ Extrai o arquivo do formData
  const formData = await request.formData();
  const arquivo = formData.get("avatar") as File | null;
  if (!arquivo) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  // 3️⃣ Valida tipo e tamanho (máx 2 MB)
  if (!arquivo.type.startsWith("image/")) {
    return NextResponse.json({ error: "Só são permitidas imagens" }, { status: 400 });
  }
  if (arquivo.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo maior que 2 MB" }, { status: 400 });
  }

  // 4️⃣ Prepara diretório
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  fs.mkdirSync(uploadDir, { recursive: true });

  // 5️⃣ Gera nome único e salva no disco
  const ext = path.extname(arquivo.name);
  const fileName = `avatar_${payload.userId}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // 6️⃣ Atualiza URL no banco
  const url = `/uploads/avatars/${fileName}`;
  await prisma.user.update({
    where: { id: payload.userId },
    data: { avatarUrl: url },
  });

  // 7️⃣ Retorna JSON válido
  return NextResponse.json({ ok: true, url });
}
