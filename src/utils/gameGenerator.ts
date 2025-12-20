interface GenerationOptions {
  fixedNumbers?: number[];
  excludedNumbers?: number[];
  atrasados?: number[];
  frequencias?: Record<number, number>;
}

export function generateGameWithPreferences(options: GenerationOptions = {}): number[] {
  const { fixedNumbers = [], excludedNumbers = [], atrasados = [], frequencias = {} } = options;
  
  // Validar que números fixos não estão na lista de excluídos
  const validFixedNumbers = fixedNumbers.filter(n => !excludedNumbers.includes(n));
  
  // Criar pool de números disponíveis (excluindo os fixos e excluídos)
  const availableNumbers = Array.from({ length: 25 }, (_, i) => i + 1)
    .filter(n => !validFixedNumbers.includes(n) && !excludedNumbers.includes(n));
  
  // Calcular quantos números ainda precisamos gerar
  const numbersNeeded = 15 - validFixedNumbers.length;
  
  if (numbersNeeded <= 0) {
    return validFixedNumbers.slice(0, 15).sort((a, b) => a - b);
  }
  
  if (availableNumbers.length < numbersNeeded) {
    throw new Error('Não há números suficientes disponíveis para gerar o jogo');
  }
  
  // Aplicar pesos baseados em frequências e atrasos
  const weightedNumbers = availableNumbers.map(num => {
    const freq = frequencias[num] || 0;
    const isDelayed = atrasados.includes(num);
    const weight = freq + (isDelayed ? 10 : 0);
    return { number: num, weight };
  });
  
  // Ordenar por peso e selecionar os melhores
  weightedNumbers.sort((a, b) => b.weight - a.weight);
  
  // Selecionar números com alguma aleatoriedade
  const selectedNumbers = [];
  const topNumbers = weightedNumbers.slice(0, Math.min(numbersNeeded * 2, weightedNumbers.length));
  
  while (selectedNumbers.length < numbersNeeded && topNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * Math.min(topNumbers.length, 8));
    const selected = topNumbers.splice(randomIndex, 1)[0];
    selectedNumbers.push(selected.number);
  }
  
  // Combinar números fixos com os selecionados e ordenar
  return [...validFixedNumbers, ...selectedNumbers].sort((a, b) => a - b);
}