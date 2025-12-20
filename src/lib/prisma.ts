// ======================================================================
// ARQUIVO: src/lib/prisma.ts
// DESCRIÇÃO: Singleton do Prisma Client para o banco principal.
// ======================================================================

import { PrismaClient } from '@prisma/client';

const globalParaPrisma = global as unknown as { prisma?: PrismaClient };

// Heurística H5: Prevenção de Erros (Garante instância única)
export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prisma = prisma;
}