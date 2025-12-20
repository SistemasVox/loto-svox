import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loteriaPrisma } from "@/lib/loteriaPrisma";
import { memoriaTrafego } from "@/lib/trafficMemory";

export async function GET() {
  try {
    // 1. Dados dos bancos (Lotofácil e Usuários)
    const totalJogos = await loteriaPrisma.loto.count();
    const [total, premium] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { plano: 'PREMIO' } })
    ]);

    // 2. Dados da Memória (Online)
    const onlineMemoria = memoriaTrafego.obterTodos();
    
    const onlineDetails = await Promise.all(
      onlineMemoria.map(async (acesso) => {
        let identificador = "Visitante";
        let role = "user";

        if (acesso.userId) {
          const u = await prisma.user.findUnique({
            where: { id: acesso.userId },
            select: { email: true }
          });
          if (u) {
            identificador = u.email;
            if (u.email.includes('admin')) role = "admin";
          }
        }

        return {
          id: identificador,
          ip: acesso.ip,
          role,
          time: new Date(acesso.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      })
    );

    return NextResponse.json({
      dbStats: { totalJogos, ultimaData: "Sincronizado" },
      userStats: { total, premium, free: total - premium },
      onlineDetails
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}