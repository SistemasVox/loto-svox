import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";
import { PLANOS_CONFIG } from "@/utils/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await checkAdminAccess();
    if (!admin) return NextResponse.json({ error: "403" }, { status: 403 });

    // 1. Consultas fundamentais
    const [totalMembros, totalJogos, acessosAgora] = await Promise.all([
      prisma.user.count(),
      prisma.loto.count(),
      prisma.traffic.findMany({ 
        take: 15, 
        orderBy: { timestamp: 'desc' },
        select: { email: true, ip: true, timestamp: true }
      })
    ]);

    // 2. Agregação por Nível de Plano (Resolvendo a nova demanda)
    const distribuicaoPlanos = await prisma.subscription.groupBy({
      by: ['plano'],
      _count: { _all: true },
      where: { status: 'ACTIVE' }
    });

    // Formata o mapa de contagem (ex: { FREE: 10, BASICO: 5 })
    const contagemPlanos = distribuicaoPlanos.reduce((acc: any, curr) => {
      acc[curr.plano] = curr._count._all;
      return acc;
    }, {});

    const acessosFormatados = acessosAgora.map(t => ({
      email: t.email || 'Visitante',
      ip: t.ip,
      lastActive: new Date(t.timestamp).toLocaleTimeString('pt-BR')
    }));

    return NextResponse.json({
      totalMembros,
      totalJogos,
      membrosAtivos: distribuicaoPlanos.reduce((sum, item) => sum + item._count._all, 0),
      contagemPlanos, // Dados para os badges de nível
      acessosAgora: acessosFormatados,
      planosDisponiveis: PLANOS_CONFIG.map(p => p.id)
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}