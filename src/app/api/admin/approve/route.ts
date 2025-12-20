// src/app/api/admin/approve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const administrador = await checkAdminAccess();
    if (!administrador) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

    const { userId, acao } = await req.json(); // acao: 'aprovar' | 'rejeitar'

    const usuarioAlvo = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, plano_solicitado: true }
    });

    if (!usuarioAlvo?.plano_solicitado) {
      return NextResponse.json({ erro: "Nenhuma solicitação pendente." }, { status: 404 });
    }

    if (acao === "rejeitar") {
      await prisma.user.update({
        where: { id: userId },
        data: { plano_solicitado: null, data_solicitacao: null },
      });
      return NextResponse.json({ msg: "Solicitação rejeitada." });
    }

    // LÓGICA DE APROVAÇÃO E VALIDADE
    if (acao === "aprovar") {
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30); // Define 30 dias de validade

      await prisma.$transaction([
        // 1. Atualiza ou cria a assinatura ativa
        prisma.subscription.upsert({
          where: { 
            // Procura assinatura existente para atualizar ou cria com ID 0 (novo)
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
        
        // 2. Notifica o utilizador
        prisma.notification.create({
          data: {
            userId: userId,
            message: `✅ Seu plano ${usuarioAlvo.plano_solicitado} foi aprovado! Válido até ${dataExpiracao.toLocaleDateString()}.`,
          }
        }),

        // 3. Limpa o pedido pendente
        prisma.user.update({
          where: { id: userId },
          data: { plano_solicitado: null, data_solicitacao: null },
        }),
      ]);

      return NextResponse.json({ msg: "Plano aprovado por 30 dias." });
    }
  } catch (erro) {
    return NextResponse.json({ erro: "Erro ao processar aprovação." }, { status: 500 });
  }
}