import { PrismaClient } from '@prisma/client-lotofacil';

const globalParaLoteria = global as unknown as { loteriaPrisma?: PrismaClient };

export const loteriaPrisma =
  globalParaLoteria.loteriaPrisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalParaLoteria.loteriaPrisma = loteriaPrisma;
}