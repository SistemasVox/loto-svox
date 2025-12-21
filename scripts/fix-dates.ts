/* =============================================================================
 * SCRIPT: scripts/fix-dates.ts
 * STATUS: Corrigido (Resiliência a Null/Undefined para Strict TypeScript)
 * DESCRIÇÃO: Normaliza datas no SQLite (DD/MM/YYYY -> YYYY-MM-DD).
 * ============================================================================= */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- [INICIANDO MANUTENÇÃO DE DATAS] ---');

  const registros = await prisma.loto.findMany();
  
  let corrigidos = 0;
  let falhas = 0;

  for (const reg of registros) {
    // RESOLUÇÃO DO ERRO TS18047: Cláusula de guarda para garantir que dataOriginal não é null
    const dataOriginal = reg.data_concurso;
    
    if (!dataOriginal) {
      console.log(`[AVISO] Concurso ${reg.concurso} não possui data. Pulando.`);
      continue;
    }

    // A partir daqui, o TypeScript sabe que dataOriginal é obrigatoriamente uma string
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (regexISO.test(dataOriginal.split('T')[0])) {
      continue;
    }

    console.log(`[ANALISANDO] Concurso ${reg.concurso}: "${dataOriginal}"`);

    let dataNova: string | null = null;

    // Caso 1: Formato Brasileiro (DD/MM/YYYY)
    if (dataOriginal.includes('/')) {
      const parts = dataOriginal.split('/');
      if (parts.length === 3) {
        const [dia, mes, ano] = parts;
        dataNova = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
    } 
    // Caso 2: Formato com traços (YYYY-MM-DD ou lixo de timezone)
    else if (dataOriginal.includes('-')) {
      dataNova = dataOriginal.split('T')[0].split(' ')[0];
    }

    if (dataNova && dataNova !== dataOriginal) {
      try {
        await prisma.loto.update({
          where: { concurso: reg.concurso },
          data: { data_concurso: dataNova }
        });
        console.log(`   ✅ CORRIGIDO: -> ${dataNova}`);
        corrigidos++;
      } catch (err: any) {
        console.error(`   ❌ ERRO ao atualizar concurso ${reg.concurso}: ${err.message}`);
        falhas++;
      }
    } else {
      console.log(`   ⚠️ FORMATO NÃO RECONHECIDO. Pular.`);
    }
  }

  console.log('\n--- [RESULTADO FINAL] ---');
  console.log(`Total processado: ${registros.length}`);
  console.log(`Corrigidos: ${corrigidos}`);
  console.log(`Falhas: ${falhas}`);
}

main()
  .catch((e) => {
    console.error('[CRITICAL ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });