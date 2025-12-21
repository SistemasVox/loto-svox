// ======================================================================
// SISTEMA LOTO - MONITOR DE TRÁFEGO E AUDITORIA DE IP
// ======================================================================

import { prisma } from "./prisma";

// --- CONSTANTES (ZERO MAGIC NUMBERS) ---
const JANELA_ATIVIDADE_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Registra ou atualiza a atividade de um usuário no banco SQLite.
 * Utiliza o IP como chave primária para evitar duplicidade de registros.
 *
 */
export async function registrarAtividade(email: string | null, ip: string): Promise<void> {
  try {
    // Validação de entrada obrigatória
    if (!ip) return;

    // Resiliência: Safety check para evitar crash se o modelo não existir
    if (!prisma.traffic) {
      console.warn("[WARN] Tabela 'Traffic' não encontrada no Prisma Client.");
      return;
    }

    const identificador = email || "Visitante";

    await prisma.traffic.upsert({
      where: { ip },
      update: { 
        email: identificador, 
        timestamp: new Date() 
      },
      create: { 
        ip, 
        email: identificador, 
        timestamp: new Date() 
      },
    });
  } catch (erro) {
    // Log estruturado com contexto técnico
    console.error("[CRITICAL] Falha ao persistir rastro de tráfego:", erro);
  }
}

/**
 * Recupera a lista de usuários online para o Dashboard Administrativo.
 * Exportado como 'getLiveTraffic' para compatibilidade com o AdminDashboard.
 *
 */
export async function getLiveTraffic() {
  const agora = Date.now();
  const dataLimite = new Date(agora - JANELA_ATIVIDADE_MS);

  try {
    // Defesa contra o erro 'undefined (reading findMany)'
    if (!prisma.traffic) return [];

    const registros = await prisma.traffic.findMany({
      where: {
        timestamp: { gte: dataLimite }
      },
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        ip: true,
        email: true,
        timestamp: true
      }
    });

    // Mapeamento para o formato esperado pelo frontend
    return registros.map(reg => ({
      email: reg.email,
      ip: reg.ip,
      lastActive: reg.timestamp.getTime()
    }));
  } catch (erro) {
    console.error("[ERRO] Falha ao recuperar tráfego ativo:", erro);
    return [];
  }
}