// ====================================================================
// PATH: src/services/gameGenerator/strategyBasic.ts
// ====================================================================

import { BASIC_STRATEGY_MAX_DELAY, GAME_SIZE } from './config';
import { generateGameFromMultipleColumns } from './generateGameFromMultipleColumns';

export function strategyBasic(
  qtdeNecessaria: number,
  disponiveis: number[],
  atrasados: number[],
  historicoConcursos: number[][],
  tentativasMax: number = 1000
): number[] {
  // 1. Criar subconjunto apenas com os 150 concursos mais recentes
  const historicoRecente = historicoConcursos.length > 150 
    ? historicoConcursos.slice(0, 150) 
    : historicoConcursos;

  for (let tentativa = 0; tentativa < tentativasMax; tentativa++) {
    // 2. Usar apenas os concursos recentes na geração
    const jogoBase = generateGameFromMultipleColumns({
      historicoConcursos: historicoRecente,
      intervaloBase: [0, historicoRecente.length],
      intervaloCol: [0, historicoRecente.length]
    });

    if (!jogoBase) continue;

    // Restante do código permanece igual...
    const filtrados = jogoBase.filter(num => disponiveis.includes(num));
    if (filtrados.length < qtdeNecessaria) continue;

    const atrasosNoJogo = filtrados.filter(num => atrasados.includes(num));
    const maxAtrasos = Math.min(BASIC_STRATEGY_MAX_DELAY, atrasosNoJogo.length, qtdeNecessaria);
    const atrasosSel = atrasosNoJogo.slice(0, maxAtrasos);
    const restantes = filtrados.filter(num => !atrasosSel.includes(num))
                              .slice(0, qtdeNecessaria - atrasosSel.length);

    const resultado = [...atrasosSel, ...restantes];
    if (resultado.length === qtdeNecessaria) {
      return resultado;
    }
  }

  return [];
}