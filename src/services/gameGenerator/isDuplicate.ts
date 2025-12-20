// ====================================================================
// PATH: src/services/gameGenerator/isDuplicate.ts
// ====================================================================

import { GeneratedGame } from '@/types/generator';

// --------------------------------------------------------------------
// VERIFICAÇÃO DE JOGO DUPLICADO (SEGURO)
// --------------------------------------------------------------------
/*
  Função que verifica se um jogo já existe na lista de jogos.
  Protege contra lista undefined/null.
*/
export const jogoDuplicado = (
  jogo: GeneratedGame,
  lista: GeneratedGame[] = []
): boolean => {
  if (!jogo || !Array.isArray(jogo.numbers)) return false;
  // lista sempre vira array vazio se vier undefined
  return (lista ?? []).some(
    existente =>
      Array.isArray(existente?.numbers) &&
      existente.numbers.join(',') === jogo.numbers.join(',')
  );
};
