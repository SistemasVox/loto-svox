/* =============================================================================
 * ARQUIVO: prisma/seed.ts
 * DESCRIÇÃO: Script de seed para criar/renovar uma chave de API na tabela ApiKey.
 * Executa automaticamente o seed ao rodar: npx prisma db seed
 * ============================================================================= */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/* =============================================================================
 * FUNÇÃO: generateApiKey
 * DESCRIÇÃO: Gera uma chave de API aleatória com 40 caracteres.
 * ============================================================================= */
function generateApiKey(): string {
  return crypto.randomBytes(30).toString('hex');
}

/* =============================================================================
 * FUNÇÃO PRINCIPAL: Seed de ApiKey
 * ============================================================================= */
async function main() {
  console.log('\n[SEED] Iniciando seed da tabela ApiKey...');

  // Nome do usuário/destino da chave
  const keyName = 'Default API Key';

  // Define 90 dias de validade para a chave
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  // Verifica se já existe uma chave (ajuste o filtro se quiser várias por user)
  let apiKey = await prisma.apiKey.findFirst({
    where: { name: keyName },
  });

  if (!apiKey) {
    // Cria nova chave se não existir
    const key = generateApiKey();
    apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: keyName,
        expiresAt,
      },
    });
    console.log('[SEED] Nova chave criada!');
  } else {
    // Renova se expirou
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      apiKey = await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: {
          key: generateApiKey(),
          expiresAt,
        },
      });
      console.log('[SEED] Chave existente RENOVADA!');
    } else {
      console.log('[SEED] Chave já existe e está válida.');
    }
  }

  // Exibe a chave no terminal
  console.log('==============================');
  console.log('API KEY GERADA/RENOVADA:');
  console.log(apiKey.key);
  console.log('Válida até:', apiKey.expiresAt);
  console.log('==============================\n');
}

/* =============================================================================
 * EXECUÇÃO DO SEED
 * ============================================================================= */
main()
  .catch((e) => {
    console.error('[SEED] Erro ao rodar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

