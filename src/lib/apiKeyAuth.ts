/* =============================================================================
 * LIB: apiKeyAuth.ts
 * DESCRIÇÃO: Função utilitária para validar API Key no header da requisição.
 * ============================================================================= */
import { prisma } from "@/lib/prisma";

/**
 * Valida a API Key vinda do header 'x-api-key'
 * @param req Request
 * @returns ApiKey (objeto do banco) ou null
 */
export async function validateApiKey(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return null;

  const keyDb = await prisma.apiKey.findUnique({
    where: { key: apiKey },
  });

  // Validação de expiração
  if (!keyDb || (keyDb.expiresAt && keyDb.expiresAt < new Date())) {
    return null;
  }
  return keyDb;
}
