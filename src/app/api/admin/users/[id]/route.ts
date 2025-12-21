import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

/**
 * PATCH: Atualização administrativa de nível e validade.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const administrador = await checkAdminAccess();
    if (!administrador) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

    const userId = parseInt(params.id);
    const { plano, expiresAt } = await req.json();

    // I/O Protegida: Transação para garantir integridade
    await prisma.$transaction(async (tx) => {
      const subExistente = await tx.subscription.findFirst({ where: { userId } });

      if (subExistente) {
        await tx.subscription.update({
          where: { id: subExistente.id },
          data: { 
            plano, 
            status: "ACTIVE", 
            expiresAt: new Date(expiresAt),
            updatedAt: new Date() 
          }
        });
      } else {
        await tx.subscription.create({
          data: { 
            userId, 
            plano, 
            status: "ACTIVE", 
            expiresAt: new Date(expiresAt) 
          }
        });
      }

      // Registro histórico de intervenção administrativa
      await tx.notification.create({
        data: {
          userId,
          message: `🛠️ Seu nível foi alterado administrativamente para ${plano}. Nova validade: ${new Date(expiresAt).toLocaleDateString('pt-BR')}.`
        }
      });
    });

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return NextResponse.json({ erro: "Falha na atualização manual." }, { status: 500 });
  }
}