// src/lib/auth.ts

// ======================================================================
// IMPORTS
// ======================================================================
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// ======================================================================
// CONSTANTES E CONFIGURAÇÕES
// ======================================================================
const JWT_SECRET = process.env.JWT_SECRET!;

// ======================================================================
// INTERFACES E TIPOS
// ======================================================================
interface UserPayload {
  userId: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
}

// ======================================================================
// FUNÇÕES PRINCIPAIS
// ======================================================================

// ======================================================================
// OBTÉM USUÁRIO ATUAL PELO TOKEN
// ======================================================================
export async function getCurrentUser(
  token: string | null
): Promise<CurrentUser | null> {
  if (!token) return null;
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });
  } catch (err) {
    console.error("Erro na verificação do token:", err);
    return null;
  }
}

// ======================================================================
// GERA TOKEN DE AUTENTICAÇÃO
// ======================================================================
export function createAuthToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// ======================================================================
// DECODIFICA TOKEN
// ======================================================================
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// ======================================================================
// ATUALIZA PERFIL DO USUÁRIO
// ======================================================================
export async function updateUserProfile(
  token: string | null,
  data: { name: string; email: string }
): Promise<CurrentUser> {
  if (!token) throw new Error("Token não informado");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Token inválido");

  const existing = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { email: true },
  });
  if (!existing) throw new Error("Usuário não encontrado");

  const updateData: { name: string; email?: string } = { name: data.name };
  if (data.email.trim().toLowerCase() !== existing.email.trim().toLowerCase()) {
    updateData.email = data.email.trim();
  }

  try {
    return await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: { id: true, email: true, name: true },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("Email já está em uso.");
    }
    throw err;
  }
}

// ======================================================================
// ALTERA SENHA DO USUÁRIO
// ======================================================================
export async function changeUserPassword(
  token: string | null,
  data: { currentPassword: string; newPassword: string }
): Promise<void> {
  if (!token) throw new Error("Token não informado");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Token inválido");

  const userRecord = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { hashedPassword: true },
  });
  if (!userRecord) throw new Error("Usuário não encontrado");

  const match = await bcrypt.compare(data.currentPassword, userRecord.hashedPassword);
  if (!match) throw new Error("Senha atual incorreta");

  const newHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({
    where: { id: payload.userId },
    data: { hashedPassword: newHash },
  });
}