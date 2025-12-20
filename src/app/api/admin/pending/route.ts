import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

/**
 * GET: Recupera a lista de usuários que possuem solicitações de plano ativas.
 * Requisito: Apenas administradores definidos em ADMIN_EMAILS.
 */
export async function GET() {
  try {
    // 1. Validação de Segurança em Camada de Servidor
    const administrador = await checkAdminAccess();
    if (!administrador) {
      return NextResponse.json(
        { erro: "Acesso negado: Privilégios insuficientes." },
        { status: 403 }
      );
    }

    // 2. Consulta ao Banco de Dados Principal (dev.db)
    // Filtramos usuários onde o campo plano_solicitado não é nulo
    const pedidosPendentes = await prisma.user.findMany({
      where: {
        NOT: {
          plano_solicitado: null,
        },
      },
      select: {
        id: true,
        email: true,
        plano_solicitado: true,
        data_solicitacao: true,
      },
      orderBy: {
        data_solicitacao: "asc", // Prioridade para pedidos mais antigos
      },
    });

    // 3. Retorno estruturado para o Frontend
    return NextResponse.json(pedidosPendentes);
    
  } catch (erro) {
    // Registro de erro resiliente
    console.error("[CRITICAL] Erro ao buscar pedidos pendentes:", erro);
    
    return NextResponse.json(
      { erro: "Falha interna ao processar a lista de solicitações." },
      { status: 500 }
    );
  }
}