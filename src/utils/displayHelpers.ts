// =============================================================================
// ARQUIVO: src/utils/displayHelpers.ts
// DESCRIÇÃO: Funções utilitárias puras para formatação e exibição de dados.
// =============================================================================

export function getLevelDisplayName(level: "free" | "basic" | "plus" | "premium"): string {
  const names = {
    free: 'Gratuito',
    basic: 'Básico',
    plus: 'Plus',
    premium: 'Premium',
  };
  return names[level] || 'Desconhecido';
}