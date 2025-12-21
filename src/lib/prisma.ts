// ======================================================================
// ARQUIVO: src/lib/prisma.ts
// DESCRIÇÃO: Singleton do Prisma Client para o banco unificado (dev.db).
// ======================================================================

import { PrismaClient } from '@prisma/client';

// Extensão do objeto global para persistir a instância fora do ciclo de hot-reload
const globalParaPrisma = global as unknown as { prisma?: PrismaClient };

/**
 * Instância única do Prisma. 
 * Em produção, utiliza log de erros. Em desenvolvimento, loga queries para debug.
 */
export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Previne a criação de múltiplas instâncias em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prisma = prisma;
}