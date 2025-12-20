/* =============================================================================
 * ARQUIVO: src/app/api/auth/saved-games/[id]/route.ts
 * DESCRIÇÃO: Endpoint DELETE para remover aposta/jogo salvo (Lotofácil) pelo ID
 *            OTIMIZADO com consulta mais eficiente e logs de segurança
 * ============================================================================= */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
const ENABLE_SECURITY_LOGS = true; // Controle global para logs de segurança

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ==== 1) Extrair token do cookie ====
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;

    // ==== 2) Extrair e parsear o ID da rota ====
    const { id } = await params;
    const gameId = parseInt(id, 10);

    // ==== 3) Validar se o ID é um número válido ====
    if (isNaN(gameId) || gameId <= 0) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // ==== 4) Autenticar usuário ====
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // ==== 5) Buscar aposta que pertence ao usuário (consulta otimizada) ====
    const bet = await prisma.bet.findFirst({
      where: { 
        id: gameId,
        userId: user.id  // Já filtra por usuário na query
      },
    });

    // ==== 6) Verificar se a aposta existe e pertence ao usuário ====
    if (!bet) {
      // Log de segurança para tentativas suspeitas (controlado por variável global)
      if (ENABLE_SECURITY_LOGS) {
        console.warn(`[SECURITY] Tentativa de exclusão não autorizada: User ${user.id} tentou deletar jogo ${gameId}`);
      }
      
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 }
      );
    }

    // ==== 7) Deletar aposta (agora temos certeza que pertence ao usuário) ====
    await prisma.bet.delete({
      where: { id: gameId },
    });

    // ==== 8) Log de sucesso (controlado por variável global) ====
    if (ENABLE_SECURITY_LOGS) {
      console.log(`[SUCCESS] User ${user.id} deletou jogo ${gameId} com sucesso`);
    }

    // ==== 9) Retornar sucesso ====
    return NextResponse.json({ 
      ok: true,
      message: "Jogo deletado com sucesso"
    });

  } catch (err) {
    console.error("Erro ao excluir jogo salvo:", err);
    return NextResponse.json(
      { error: "Erro interno ao excluir jogo" },
      { status: 500 }
    );
  }
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */