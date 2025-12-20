// src/utils/constants.ts

// ---
// CONSTANTES GLOBAIS
// ---

// Limites de geração por tipo de usuário
export const GENERATION_LIMITS = {
  free: 3,
  basic: 6,
  plus: 10,
  premium: 30
};

// Descrições dos níveis de gerador
export const LEVEL_DESCRIPTIONS = {
  free: "Gera combinações aleatórias sem critério estratégico",
  basic: "Prioriza números atrasados com base em dados históricos",
  plus: "Combina análise de frequência, padrões históricos e números atrasados",
  premium: "Combinação otimizada com múltiplas estratégias"
};

// Configurações de números para Lotofácil
export const LOTOFACIL_SETTINGS = {
  minNumber: 1,
  maxNumber: 25,
  numbersPerGame: 15
};

// Máximo de tentativas para geração de jogos únicos
export const MAX_GENERATION_ATTEMPTS = 100;