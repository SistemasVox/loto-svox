// ======================================================================
// ARQUIVO: src/lib/auth.ts
// DESCRIÇÃO: Gestão de Autenticação e Verificação de Protocolo Ativo.
// ======================================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// --- CONSTANTES (ZERO MAGIC NUMBERS) ---
const SEGREDO_JWT = process.env.JWT_SECRET || "segredo_temporario_vps";
const SALTO_BCRYPT = 10;
const TEMPO_TOKEN = "7d";

interface CargaToken {
  userId: number;
}

/**
 * Obtém o usuário atual e valida a expiração do plano de 30 dias.
 * Se expirado, o status é alterado para 'PAST_DUE' no banco de dados.
 */
export async function getCurrentUser(token: string | null): Promise<any | null> {
  if (!token) return null;

  try {
    const decodificado = jwt.verify(token, SEGREDO_JWT) as CargaToken;

    // Busca usuário com transação de leitura protegida
    const usuario = await prisma.user.findUnique({
      where: { id: decodificado.userId },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!usuario) return null;

    const assinaturaAtiva = usuario.subscriptions[0];

    // LÓGICA DE ENFORCEMENT DE EXPIRAÇÃO
    if (assinaturaAtiva && assinaturaAtiva.expiresAt) {
      const agora = new Date();
      const dataExpiracao = new Date(assinaturaAtiva.expiresAt);

      if (agora > dataExpiracao) {
        try {
          // Downgrade silencioso e atômico
          await prisma.subscription.update({
            where: { id: assinaturaAtiva.id },
            data: { status: "PAST_DUE" },
          });
          
          console.info(`[INFO] Protocolo expirado e revogado para: ${usuario.email}`);
        } catch (erro_io) {
          console.error("[ERRO] Falha ao persistir expiração no banco", erro_io);
        }

        // Retorna o usuário como FREE para o sistema atual
        return { ...usuario, subscriptions: [] };
      }
    }

    return usuario;
  } catch (erro_token) {
    // Token inválido ou corrompido: trata como visitante
    return null;
  }
}

/**
 * Utilitários de Token e Senha (Segurança Obrigatória)
 */
export function createAuthToken(userId: number): string {
  return jwt.sign({ userId }, SEGREDO_JWT, { expiresIn: TEMPO_TOKEN });
}

export function verifyToken(token: string): CargaToken | null {
  try {
    return jwt.verify(token, SEGREDO_JWT) as CargaToken;
  } catch {
    return null;
  }
}

export async function changeUserPassword(
  token: string | null,
  dados: { currentPassword: string; newPassword: string }
): Promise<void> {
  if (!token) throw new Error("Acesso negado.");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Sessão expirada.");

  const registro = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { hashedPassword: true },
  });

  if (!registro) throw new Error("Usuário não localizado.");

  const match = await bcrypt.compare(dados.currentPassword, registro.hashedPassword);
  if (!match) throw new Error("A senha atual está incorreta.");

  const novoHash = await bcrypt.hash(dados.newPassword, SALTO_BCRYPT);
  
  await prisma.user.update({
    where: { id: payload.userId },
    data: { hashedPassword: novoHash },
  });
}