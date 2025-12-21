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

// CONFIGURAÇÃO DOS PLANOS DE ASSINATURA
export const PLANOS_CONFIG = [
  {
    id: "FREE",
    nome: "GRATUITO",
    preco: "R$ 0",
    cor: "text-slate-400",
    border: "border-slate-800",
    neon: "shadow-none",
    beneficios: ["3 Jogos/vez", "IA Aleatória", "Vitalício"],
    linkNubank: "https://nubank.com.br/cobrar/i29t/69365617-8a30-40e9-8ef3-2b157e073683",
  },
  {
    id: "BASICO",
    nome: "BÁSICO",
    preco: "R$ 19,90",
    cor: "text-green-500",
    border: "border-green-500/50",
    neon: "hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]",
    beneficios: ["10 Jogos/vez", "IA Equilibrada", "30 Dias Acesso"],
    linkNubank: "https://nubank.com.br/cobrar/i29t/69365547-ddad-4aa1-9a09-2d249a4c2387",
  },
  {
    id: "PLUS",
    nome: "PLUS",
    preco: "R$ 39,90",
    cor: "text-cyan-400",
    border: "border-cyan-400/50",
    neon: "hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    beneficios: ["50 Jogos/vez", "IA Quentes", "30 Dias Acesso"],
    linkNubank: "https://nubank.com.br/cobrar/i29t/69365578-a4ae-4cbc-adbc-9222aca0c2a6",
  },
  {
    id: "PREMIO",
    nome: "PRÊMIO",
    preco: "R$ 59,90",
    cor: "text-pink-500",
    border: "border-pink-500/50",
    neon: "hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    beneficios: ["100 Jogos/vez", "TODAS as IAs", "30 Dias Acesso"],
    linkNubank: "https://nubank.com.br/cobrar/i29t/693655d7-ba96-452f-85e9-ee83a6b62879",
  },
];