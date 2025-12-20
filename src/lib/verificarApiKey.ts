// =============================================================================
// ARQUIVO: src/lib/verificarApiKey.ts
// DESCRIÇÃO: Função utilitária para validar API KEY no header
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// =============================================================================
// FUNÇÃO: verificarApiKey
// =============================================================================
export async function verificarApiKey(req: NextRequest) {
  // Busca a chave no header
  const apiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization") || // fallback se vier como "authorization"
    "";

  if (!apiKey) {
    return {
      ok: false,
      error: "Não autorizado",
      detalhe: "Chave de API ausente",
    };
  }

  // Busca no banco
  const registro = await prisma.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!registro) {
    return {
      ok: false,
      error: "Não autorizado",
      detalhe: "Chave de API inválida",
    };
  }

  if (registro.expiresAt && registro.expiresAt < new Date()) {
    return {
      ok: false,
      error: "Não autorizado",
      detalhe: "Chave de API expirada",
    };
  }

  return {
    ok: true,
    keyId: registro.id,
    expiresAt: registro.expiresAt,
    nome: registro.name,
  };
}
