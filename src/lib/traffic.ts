import { prisma } from "./prisma";

/**
 * Registra o IP no banco SQLite
 */
export async function registrarAcesso(ip: string, usuarioId: number | null = null): Promise<void> {
  try {
    // Se o modelo não existir por erro de build, ignora para não travar o site
    if (!prisma.traffic) return;

    await prisma.traffic.upsert({
      where: { ip },
      update: { userId: usuarioId, timestamp: new Date() },
      create: { ip, userId: usuarioId, timestamp: new Date() },
    });
  } catch (e) {
    console.error("Erro ao gravar tráfego:", e);
  }
}

/**
 * Pega quem acessou nos últimos 5 minutos
 */
export async function obterDadosTrafego() {
  const LIMITE = new Date(Date.now() - 5 * 60 * 1000);
  try {
    if (!prisma.traffic) return [];
    return await prisma.traffic.findMany({
      where: { timestamp: { gte: LIMITE } },
      orderBy: { timestamp: 'desc' }
    });
  } catch (e) {
    return [];
  }
}