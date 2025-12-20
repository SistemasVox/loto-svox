import { generateGameFromMultipleColumns } from './generateGameFromMultipleColumns';

export type StrategyFreeOptions = {
  historicoConcursos: number[][],
  quantidadeJogos: number,
  intervaloJogos?: [number, number],
  maxColunasPerGame?: number,
  maxTentativas?: number,
}

export function strategyFree(options: StrategyFreeOptions): number[][] {
  const {
    historicoConcursos,
    quantidadeJogos,
    intervaloJogos = [0, 100],
    maxColunasPerGame = 2,
    maxTentativas = 1000
  } = options;

  const jogos: number[][] = [];

  for (let i = 0; i < quantidadeJogos; ) {
    const jogo = generateGameFromMultipleColumns({
      historicoConcursos,
      intervaloJogos,
      maxColunasPerGame,
      maxTentativas
    });
    
    if (
      jogo &&
      jogos.every(j => j.join(',') !== jogo.join(','))
    ) {
      jogos.push(jogo);
      i++;
    }
  }
  
  return jogos;
}