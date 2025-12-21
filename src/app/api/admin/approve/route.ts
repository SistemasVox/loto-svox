// ======================================================================
// SISTEMA LOTO - APROVAÇÃO DE PROTOCOLOS (AUDITORIA PIX)
// ======================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Singleton unificado
import { checkAdminAccess } from "@/lib/admin";

// --- CONSTANTES DE NEGÓCIO (ZERO MAGIC NUMBERS) ---
const DIAS_VALIDADE_PLANO = 30;
const STATUS_ATIVO = "ACTIVE";
const SUCESSO_MSG = "Acesso liberado e notificação enviada.";
const ERRO_PERMISSAO = "Acesso negado: Requer privilégios de Admin.";
const ERRO_SOLICITACAO = "Nenhuma solicitação pendente para este usuário.";

export async function POST(req: Request) {
  try {
    // 1. Validação de Segurança (AdminRole no dev.db)
    const administrador = await checkAdminAccess();
    if (!administrador) {
      console.warn("[WARN] Tentativa de aprovação não autorizada.");
      return NextResponse.json({ erro: ERRO_PERMISSAO }, { status: 403 });
    }

    // 2. Extração e Validação de Input
    const { userId, acao } = await req.json();
    if (!userId || !acao) {
      return NextResponse.json({ erro: "Dados incompletos (userId/acao)." }, { status: 400 });
    }

    // 3. Verificação de Estado Inicial
    const usuarioAlvo = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, plano_solicitado: true }
    });

    if (!usuarioAlvo?.plano_solicitado) {
      return NextResponse.json({ erro: ERRO_SOLICITACAO }, { status: 404 });
    }

    // 4. Lógica de Rejeição (Limpeza de rastro)
    if (acao === "rejeitar") {
      await prisma.user.update({
        where: { id: userId },
        data: { plano_solicitado: null, data_solicitacao: null },
      });
      console.info(`[INFO] Solicitação do usuário ${userId} rejeitada.`);
      return NextResponse.json({ msg: "Solicitação removida do sistema." });
    }

    // 5. Cálculo de Vigência
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + DIAS_VALIDADE_PLANO);

    // 6. Transação Atômica: Assinatura + Notificação + Limpeza
    await prisma.$transaction(async (tx) => {
      // Upsert manual para SQLite (Garante 1 assinatura por usuário)
      const subExistente = await tx.subscription.findFirst({ where: { userId } });

      if (subExistente) {
        await tx.subscription.update({
          where: { id: subExistente.id },
          data: { 
            plano: usuarioAlvo.plano_solicitado as any, 
            status: STATUS_ATIVO, 
            expiresAt: dataExpiracao 
          }
        });
      } else {
        await tx.subscription.create({
          data: { 
            userId, 
            plano: usuarioAlvo.plano_solicitado as any, 
            status: STATUS_ATIVO, 
            expiresAt: dataExpiracao 
          }
        });
      }

      // Registro de Notificação Interna
      await tx.notification.create({
        data: {
          userId,
          message: `✅ Protocolo ${usuarioAlvo.plano_solicitado} Ativado! Expira em: ${dataExpiracao.toLocaleDateString('pt-BR')}.`
        }
      });

      // Finalização do fluxo no perfil do usuário
      await tx.user.update({
        where: { id: userId },
        data: { plano_solicitado: null, data_solicitacao: null }
      });
    });

    console.info(`[INFO] Plano ${usuarioAlvo.plano_solicitado} aprovado para: ${usuarioAlvo.email}`);
    return NextResponse.json({ msg: SUCESSO_MSG });

  } catch (erro: any) {
    console.error("[CRITICAL] Erro na transação de aprovação:", erro.message);
    return NextResponse.json({ erro: "Falha interna na persistência do plano." }, { status: 500 });
  }
}