// ======================================================================
// SISTEMA LOTO - PERSISTÊNCIA DE TRÁFEGO (DB UNIFICADO)
// ======================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Singleton unificado

export async function POST(req: Request) {
  try {
    const { ip, userId } = await req.json();

    if (!ip) {
      return NextResponse.json({ error: "IP ausente" }, { status: 400 });
    }

    // 1. Identificação do Usuário (Se houver userId, busca o e-mail)
    let emailUsuario = "Visitante";
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      if (user) emailUsuario = user.email;
    }

    // 2. Persistência Atômica na Tabela Traffic
    // Usamos upsert para atualizar o timestamp se o IP já existir
    await prisma.traffic.upsert({
      where: { ip: ip },
      update: { 
        email: emailUsuario, 
        timestamp: new Date() 
      },
      create: { 
        ip: ip, 
        email: emailUsuario, 
        timestamp: new Date() 
      },
    });

    // 3. Higiene do Banco (Opcional): Remove registros com mais de 10 minutos
    // Isso mantém a característica de "dados temporários"
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.traffic.deleteMany({
      where: { timestamp: { lt: dezMinutosAtras } }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CRITICAL] Erro ao registrar tráfego no banco:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}