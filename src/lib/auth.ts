import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// --- CONSTANTES (ZERO MAGIC NUMBERS) ---
const SEGREDO_JWT = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const EXPIRACAO_SESSAO = "7d";

interface AuthPayload {
  userId: number;
}

/**
 * Recupera o usuário do banco incluindo permissões (AdminRole) e planos.
 * @param token JWT recebido via cookie.
 */
export async function getCurrentUser(token: string | null): Promise<any | null> {
  if (!token || !SEGREDO_JWT) return null;

  try {
    const decoded = jwt.verify(token, SEGREDO_JWT) as AuthPayload;

    // I/O com inclusão da nova tabela de permissões
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true, // Garante que a flag de admin venha do banco
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      console.warn(`[AUTH] Usuário ID ${decoded.userId} não encontrado.`);
      return null;
    }

    // Gerenciamento de validade de plano
    const activeSub = user.subscriptions[0];
    if (activeSub && activeSub.expiresAt) {
      const agora = new Date();
      const expiracao = new Date(activeSub.expiresAt);

      if (agora > expiracao) {
        try {
          await prisma.subscription.update({
            where: { id: activeSub.id },
            data: { status: "PAST_DUE" },
          });
          return { ...user, subscriptions: [] };
        } catch (erroBanco) {
          console.error("[CRITICAL] Erro ao expirar plano:", erroBanco);
        }
      }
    }

    return user;
  } catch (erro) {
    console.error("[AUTH] Falha na verificação do token:", erro);
    return null;
  }
}

export function verifyToken(token: string): AuthPayload | null {
  if (!SEGREDO_JWT) return null;
  try {
    return jwt.verify(token, SEGREDO_JWT) as AuthPayload;
  } catch {
    return null;
  }
}

export function createAuthToken(userId: number): string {
  if (!SEGREDO_JWT) throw new Error("JWT_SECRET ausente.");
  return jwt.sign({ userId }, SEGREDO_JWT, { expiresIn: EXPIRACAO_SESSAO });
}

export async function updateUserProfile(
  token: string | null,
  data: { name: string; email: string }
): Promise<any> {
  if (!token) throw new Error("Não autorizado");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Sessão expirada");

  try {
    return await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: data.name,
        email: data.email.trim().toLowerCase(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("E-mail em uso por outro usuário.");
    }
    throw error;
  }
}

export async function changeUserPassword(
  token: string | null,
  data: { currentPassword: string; newPassword: string }
): Promise<void> {
  if (!token) throw new Error("Token ausente");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Token inválido");

  const userRecord = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { hashedPassword: true },
  });

  if (!userRecord) throw new Error("Usuário inexistente");

  const isValid = await bcrypt.compare(data.currentPassword, userRecord.hashedPassword);
  if (!isValid) throw new Error("Senha atual incorreta");

  const newHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: payload.userId },
    data: { hashedPassword: newHash },
  });
}