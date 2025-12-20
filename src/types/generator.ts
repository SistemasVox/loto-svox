// src/types/generator.ts

// ---
// TIPOS PRINCIPAIS
// ---
export type GeneratorType = 'free' | 'basic' | 'plus' | 'premium';

export interface GeneratedGame {
  id: number;
  numbers: number[];
  date: Date;
}

export interface ResultadoHistorico {
  concurso: number;
  data_concurso: string;
  dezenas: string;
}

// ---
// LIMITES POR CATEGORIA
// ---
export const CATEGORY_LIMITS: Record<GeneratorType, number> = {
  free: 3,
  basic: 6,
  plus: 10,
  premium: 30
};

// ---
// DESCRIÇÕES DOS NÍVEIS
// ---
export const LEVEL_DESCRIPTIONS: Record<GeneratorType, string> = {
  free: "Gera combinações aleatórias sem critério estratégico. Limite: 3 jogos.",
  basic: "Prioriza números atrasados com base em dados históricos. Limite: 6 jogos.",
  plus: "Combina análise de frequência, padrões históricos e números atrasados. Limite: 10 jogos.",
  premium: "Combinação otimizada com múltiplas estratégias. Limite: 30 jogos."
};