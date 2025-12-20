import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

/**
 * POST: Processa a decisão do administrador sobre uma solicitação de plano.
 * Implementa transação atômica para garantir a integridade dos dados entre tabelas.
 */
export async function POST(req: Request) {
  try {
    // 1. Validação de Segurança (Camada de Servidor)
    const administrador = await checkAdminAccess();
    if (!administrador) {
      return NextResponse.json(
        { erro: "Acesso negado: Privilégios de administrador requeridos." },
        { status: 403 }
      );
    }

    const corpo = await req.json();
    const { userId, acao } = corpo; // acao: 'aprovar' | 'rejeitar'

    if (!userId || !acao) {
      return NextResponse.json(
        { erro: "Parâmetros 'userId' e 'acao' são obrigatórios." },
        { status: 400 }
      );
    }

    // 2. Localização do pedido pendente
    const usuarioAlvo = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, plano_solicitado: true }
    });

    if (!usuarioAlvo || !usuarioAlvo.plano_solicitado) {
      return NextResponse.json(
        { erro: "Nenhuma solicitação pendente encontrada para este ID." },
        { status: 404 }
      );
    }

    // 3. Processamento de Rejeição
    if (acao === "rejeitar") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plano_solicitado: null,
          data_solicitacao: null,
        },
      });
      return NextResponse.json({ msg: "Solicitação rejeitada com sucesso." });
    }

    // 4. Processamento de Aprovação (Transação Atômica)
    if (acao === "aprovar") {
      // Cálculo de validade (30 dias padrão)
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      await prisma.$transaction([
        // A. Atualiza ou cria a assinatura ativa
        prisma.subscription.upsert({
          where: { 
            id: (await prisma.subscription.findFirst({ where: { userId } }))?.id || 0 
          },
          update: {
            plano: usuarioAlvo.plano_solicitado as any,
            status: "ACTIVE",
            expiresAt: dataExpiracao,
          },
          create: {
            userId: userId,
            plano: usuarioAlvo.plano_solicitado as any,
            status: "ACTIVE",
            expiresAt: dataExpiracao,
          },
        }),
        
        // B. Cria notificação interna para o usuário
        prisma.notification.create({
          data: {
            userId: userId,
            message: `✅ Seu plano ${usuarioAlvo.plano_solicitado} foi aprovado! Seus recursos já estão liberados.`,
            link: "/perfil"
          }
        }),

        // C. Limpa o pedido no perfil do usuário
        prisma.user.update({
          where: { id: userId },
          data: {
            plano_solicitado: null,
            data_solicitacao: null,
          },
        }),
      ]);

      return NextResponse.json({ 
        msg: `Plano ${usuarioAlvo.plano_solicitado} aprovado e notificação enviada.` 
      });
    }

    return NextResponse.json({ erro: "Ação não reconhecida pelo sistema." }, { status: 400 });

  } catch (erro) {
    console.error("[CRITICAL_APPROVE_API]", erro);
    return NextResponse.json(
      { erro: "Falha interna ao processar decisão de assinatura." },
      { status: 500 }
    );
  }
}