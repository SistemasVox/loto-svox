// ======================================================================
// ARQUIVO: src/lib/loteriaPrisma.ts (UNIFICADO)
// DESCRIÇÃO: Redireciona para o cliente principal para evitar erros de build.
// ======================================================================

import { prisma } from "./prisma";

/**
 * Agora que o banco foi unificado, exportamos a instância principal.
 * Isso evita o erro "Module not found" nas rotas legadas.
 */
export const loteriaPrisma = prisma;