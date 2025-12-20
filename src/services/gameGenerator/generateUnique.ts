// ====================================================================
// PATH: src/services/gameGenerator/generateUnique.ts
// ====================================================================

export const gerarNumerosUnicos = (qtde: number, min: number, max: number): number[] => {
  const numeros = new Set<number>();
  while (numeros.size < qtde) {
    numeros.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numeros).sort((a, b) => a - b);
};
