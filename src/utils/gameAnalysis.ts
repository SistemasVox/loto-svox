// src/utils/gameAnalysis.ts
import { GeneratedGame } from '@/types/generator';

// ---
// ANALISAR LOTE DE JOGOS
// Retorna:
//   comuns: números que aparecem em todos os jogos
//   exclusivos: números que aparecem em apenas um jogo
//   excluidos: números que não aparecem em nenhum jogo
// ---
export const analisarLote = (games: GeneratedGame[]) => {
  if (games.length === 0) return { comuns: [], exclusivos: [], excluidos: [] };
  
  const frequencia: Record<number, number> = {};
  
  // Contar frequência de cada número
  games.forEach(jogo => {
    jogo.numbers.forEach(num => {
      frequencia[num] = (frequencia[num] || 0) + 1;
    });
  });
  
  // Números comuns: aparecem em todos os jogos
  const comuns = Object.entries(frequencia)
    .filter(([_, count]) => count === games.length)
    .map(([num]) => parseInt(num));
  
  // Números exclusivos: aparecem em apenas um jogo
  const exclusivos = Object.entries(frequencia)
    .filter(([_, count]) => count === 1)
    .map(([num]) => parseInt(num));
  
  // Números excluídos: de 1 a 25 que não apareceram
  const todosNumeros = Array.from({ length: 25 }, (_, i) => i + 1);
  const excluidos = todosNumeros.filter(num => !frequencia[num]);
  
  return {
    comuns: comuns.sort((a, b) => a - b),
    exclusivos: exclusivos.sort((a, b) => a - b),
    excluidos: excluidos.sort((a, b) => a - b)
  };
};