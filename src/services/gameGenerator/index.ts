// ====================================================================
// PATH: src/services/gameGenerator/index.ts
// ====================================================================

import { GeneratorType, GeneratedGame } from '@/types/generator';
import { GAME_SIZE, NUMBER_MIN, NUMBER_MAX, MAX_ATTEMPTS } from './config';
import { gerarNumerosUnicos } from './generateUnique';
import { jogoDuplicado } from './isDuplicate';

import { strategyBasic } from './strategyBasic';
import { strategyPlus } from './strategyPlus';
import { strategyPremium } from './strategyPremium';
import { strategyFree, StrategyFreeOptions } from './strategyFree';

// --------------------------------------------------------------------
// Função principal de geração de jogos
// --------------------------------------------------------------------
export const gerarJogo = (
  tipo: GeneratorType,
  jogosExistentes: GeneratedGame[],
  atrasados: number[],
  frequencias: Record<number, number>,
  preferencias: { fixos: number[], excluidos: number[] } = { fixos: [], excluidos: [] },
  historicoConcursos: number[][] = [],
  strategyFreeOptions?: StrategyFreeOptions // Parâmetro obrigatório para o tipo 'free'
): GeneratedGame | null => {
  let tentativas = 0;
  let novoJogo: GeneratedGame | null = null;
  const { fixos, excluidos } = preferencias;

  // ----------------------------------------------------------------
  // Estratégia GRÁTIS: sempre por coluna, exige histórico e quantidade
  // ----------------------------------------------------------------
  if (tipo === 'free') {
    if (!strategyFreeOptions) {
      throw new Error("strategyFreeOptions deve ser informado para o tipo 'free'");
    }
    const jogosGerados = strategyFree(strategyFreeOptions);
    for (const numeros of jogosGerados) {
      // Garante que não vai duplicar
      const jogo: GeneratedGame = {
        id: Date.now() + tentativas,
        numbers: numeros,
        date: new Date()
      };
      if (!jogoDuplicado(jogo, jogosExistentes)) {
        return jogo;
      }
      tentativas++;
      if (tentativas > MAX_ATTEMPTS) {
        console.warn('Limite de tentativas atingido ao gerar jogo único');
        return null;
      }
    }
    return null;
  }

  // ----------------------------------------------------------------
  // Estratégias pagas e avançadas: continuam funcionando normalmente
  // ----------------------------------------------------------------
  do {
    let numeros: number[] = fixos.filter(num => !excluidos.includes(num));
    const disponiveis = Array.from({ length: NUMBER_MAX }, (_, i) => i + NUMBER_MIN)
      .filter(num => !excluidos.includes(num) && !numeros.includes(num));

    if (numeros.length >= GAME_SIZE) {
      numeros = numeros.slice(0, GAME_SIZE);
    } else {
      const qtdeNecessaria = GAME_SIZE - numeros.length;
      let numerosGerados: number[] = [];

      switch (tipo) {
        case 'basic':
          numerosGerados = strategyBasic(qtdeNecessaria, disponiveis, atrasados, historicoConcursos);
          break;
        case 'plus':
          numerosGerados = strategyPlus(qtdeNecessaria, disponiveis, atrasados, frequencias, historicoConcursos);
          break;
        case 'premium':
          numerosGerados = strategyPremium(qtdeNecessaria, disponiveis, atrasados, historicoConcursos);
          break;
        default:
          numerosGerados = gerarNumerosUnicos(qtdeNecessaria, NUMBER_MIN, NUMBER_MAX)
            .filter(num => disponiveis.includes(num));
      }

      numeros = [...numeros, ...numerosGerados];

      if (numeros.length < GAME_SIZE) {
        const faltantes = GAME_SIZE - numeros.length;
        const adicionais = gerarNumerosUnicos(faltantes, NUMBER_MIN, NUMBER_MAX)
          .filter(num => disponiveis.includes(num) && !numeros.includes(num))
          .slice(0, faltantes);

        numeros = [...numeros, ...adicionais];
      }
    }

    numeros = numeros.slice(0, GAME_SIZE).sort((a, b) => a - b);

    novoJogo = {
      id: Date.now() + tentativas,
      numbers: numeros,
      date: new Date()
    };

    tentativas++;
    if (tentativas > MAX_ATTEMPTS) {
      console.warn('Limite de tentativas atingido ao gerar jogo único');
      return null;
    }
  } while (jogoDuplicado(novoJogo, jogosExistentes));

  return novoJogo;
};