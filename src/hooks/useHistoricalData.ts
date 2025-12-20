// src/services/historicalAnalysis.ts
import { ResultadoHistorico } from '@/types/generator';

// === FUNÇÕES FUNDAMENTAIS ===

// 1. Calcular frequências de números
export const calculateFrequencies = (results: ResultadoHistorico[]) => {
  const frequencies: Record<number, number> = {};
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number);
    numbers.forEach(num => {
      frequencies[num] = (frequencies[num] || 0) + 1;
    });
  });
  
  return frequencies;
};

// 2. Calcular números atrasados
export const calculateDelayedNumbers = (results: ResultadoHistorico[]) => {
  if (results.length === 0) return [];
  
  const lastDraw = Math.max(...results.map(r => r.concurso));
  const lastSeen: Record<number, number> = {};
  
  for (let i = 1; i <= 25; i++) {
    lastSeen[i] = 0;
  }
  
  const sortedResults = [...results].sort((a, b) => b.concurso - a.concurso);
  
  sortedResults.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number);
    numbers.forEach(num => {
      if (lastSeen[num] === 0) {
        lastSeen[num] = result.concurso;
      }
    });
  });
  
  const delays: Record<number, number> = {};
  for (let num = 1; num <= 25; num++) {
    delays[num] = lastDraw - (lastSeen[num] || 0);
  }
  
  return Object.entries(delays)
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => parseInt(num));
};

// === FUNÇÕES AVANÇADAS ===

// 3. Sequências recorrentes
export const findCommonSequences = (
  results: ResultadoHistorico[], 
  minSequenceLength: number = 2, 
  minOccurrences: number = 5,
  maxSequenceLength: number = 4
) => {
  const sequenceMap: Map<string, { count: number; lastSeen: number; positions: number[] }> = new Map();
  
  results.forEach((result, index) => {
    const numbers = result.dezenas.split(',').map(Number).sort((a, b) => a - b);
    
    for (let length = minSequenceLength; length <= Math.min(maxSequenceLength, numbers.length); length++) {
      for (let i = 0; i <= numbers.length - length; i++) {
        const sequence = numbers.slice(i, i + length).join('-');
        const existing = sequenceMap.get(sequence) || { count: 0, lastSeen: -1, positions: [] };
        
        sequenceMap.set(sequence, {
          count: existing.count + 1,
          lastSeen: index,
          positions: [...existing.positions, index]
        });
      }
    }
  });
  
  return Array.from(sequenceMap.entries())
    .filter(([_, data]) => data.count >= minOccurrences)
    .map(([sequence, data]) => ({
      sequence,
      occurrences: data.count,
      lastSeen: data.lastSeen,
      frequency: (data.count / results.length) * 100,
      positions: data.positions,
      recency: results.length - data.lastSeen
    }))
    .sort((a, b) => b.occurrences - a.occurrences);
};

// 4. Distribuição por quadrantes
export const calculateQuadrantDistribution = (results: ResultadoHistorico[]) => {
  const quadrantData = {
    q1: { count: 0, numbers: new Set<number>(), recent: 0 },
    q2: { count: 0, numbers: new Set<number>(), recent: 0 },
    q3: { count: 0, numbers: new Set<number>(), recent: 0 },
    q4: { count: 0, numbers: new Set<number>(), recent: 0 }
  };
  
  const recentThreshold = Math.min(10, Math.floor(results.length * 0.1));
  
  results.forEach((result, index) => {
    const numbers = result.dezenas.split(',').map(Number);
    const isRecent = index >= results.length - recentThreshold;
    
    numbers.forEach(num => {
      if (num >= 1 && num <= 6) {
        quadrantData.q1.count++;
        quadrantData.q1.numbers.add(num);
        if (isRecent) quadrantData.q1.recent++;
      } else if (num >= 7 && num <= 12) {
        quadrantData.q2.count++;
        quadrantData.q2.numbers.add(num);
        if (isRecent) quadrantData.q2.recent++;
      } else if (num >= 13 && num <= 18) {
        quadrantData.q3.count++;
        quadrantData.q3.numbers.add(num);
        if (isRecent) quadrantData.q3.recent++;
      } else if (num >= 19 && num <= 25) {
        quadrantData.q4.count++;
        quadrantData.q4.numbers.add(num);
        if (isRecent) quadrantData.q4.recent++;
      }
    });
  });
  
  const totalNumbers = Object.values(quadrantData).reduce((sum, q) => sum + q.count, 0);
  const totalRecent = Object.values(quadrantData).reduce((sum, q) => sum + q.recent, 0);
  
  return {
    distribution: {
      q1: { 
        count: quadrantData.q1.count, 
        percentage: (quadrantData.q1.count / totalNumbers) * 100,
        uniqueNumbers: quadrantData.q1.numbers.size,
        recentTrend: totalRecent > 0 ? (quadrantData.q1.recent / totalRecent) * 100 : 0
      },
      q2: { 
        count: quadrantData.q2.count, 
        percentage: (quadrantData.q2.count / totalNumbers) * 100,
        uniqueNumbers: quadrantData.q2.numbers.size,
        recentTrend: totalRecent > 0 ? (quadrantData.q2.recent / totalRecent) * 100 : 0
      },
      q3: { 
        count: quadrantData.q3.count, 
        percentage: (quadrantData.q3.count / totalNumbers) * 100,
        uniqueNumbers: quadrantData.q3.numbers.size,
        recentTrend: totalRecent > 0 ? (quadrantData.q3.recent / totalRecent) * 100 : 0
      },
      q4: { 
        count: quadrantData.q4.count, 
        percentage: (quadrantData.q4.count / totalNumbers) * 100,
        uniqueNumbers: quadrantData.q4.numbers.size,
        recentTrend: totalRecent > 0 ? (quadrantData.q4.recent / totalRecent) * 100 : 0
      }
    },
    analysis: {
      mostActive: Object.entries(quadrantData).reduce((max, [key, value]) => 
        value.count > quadrantData[max as keyof typeof quadrantData].count ? key : max, 'q1'),
      trendingUp: Object.entries(quadrantData).filter(([_, value]) => 
        value.recent > value.count / results.length * recentThreshold).map(([key]) => key)
    }
  };
};

// 5. Pares vs Ímpares
export const calculateParityDistribution = (results: ResultadoHistorico[]) => {
  const parityStats = {
    totalPares: 0,
    totalImpares: 0,
    avgParesPerGame: 0,
    avgImparesPerGame: 0
  };
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number);
    const pares = numbers.filter(n => n % 2 === 0).length;
    
    parityStats.totalPares += pares;
    parityStats.totalImpares += (numbers.length - pares);
  });
  
  parityStats.avgParesPerGame = parityStats.totalPares / results.length;
  parityStats.avgImparesPerGame = parityStats.totalImpares / results.length;
  
  return parityStats;
};

// 6. Combinações Raras
export const findRareCombinations = (results: ResultadoHistorico[], maxOccurrences: number = 3) => {
  const combinationMap: Map<string, number> = new Map();
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const combo = `${numbers[i]}-${numbers[j]}`;
        combinationMap.set(combo, (combinationMap.get(combo) || 0) + 1);
      }
    }
  });
  
  const rareCombinations: string[] = [];
  combinationMap.forEach((count, combo) => {
    if (count <= maxOccurrences) {
      rareCombinations.push(combo);
    }
  });
  
  return rareCombinations;
};

// 7. Distribuição por colunas
export const calculateColumnDistribution = (results: ResultadoHistorico[]) => {
  const columnCounts = [0, 0, 0, 0, 0];
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number).sort((a, b) => a - b);
    
    numbers.forEach(num => {
      const col = (num - 1) % 5;
      columnCounts[col]++;
    });
  });
  
  return columnCounts;
};

// 8. Soma média
export const calculateAverageSum = (results: ResultadoHistorico[]) => {
  let totalSum = 0;
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number);
    totalSum += numbers.reduce((sum, num) => sum + num, 0);
  });
  
  return totalSum / results.length;
};

// 9. Análise de tendências recentes (FUNÇÃO FALTANTE)
export const analyzeRecentTrends = (results: ResultadoHistorico[], lookback: number = 30) => {
  const recentResults = results.slice(-lookback);
  
  return {
    frequencies: calculateFrequencies(recentResults),
    delayedNumbers: calculateDelayedNumbers(recentResults),
    sequences: findCommonSequences(recentResults, 2, 3),
    quadrants: calculateQuadrantDistribution(recentResults),
    parity: calculateParityDistribution(recentResults)
  };
};

// 10. Análise de temperatura
export const calculateTemperature = (results: ResultadoHistorico[], recentPeriod: number = 15) => {
  const temperature: Record<number, {
    recent: number;
    total: number;
    temperature: 'hot' | 'warm' | 'cold' | 'frozen';
    score: number;
  }> = {};
  
  for (let num = 1; num <= 25; num++) {
    temperature[num] = { recent: 0, total: 0, temperature: 'cold', score: 0 };
  }
  
  results.forEach((result, index) => {
    const numbers = result.dezenas.split(',').map(Number);
    const isRecent = index >= results.length - recentPeriod;
    
    numbers.forEach(num => {
      temperature[num].total++;
      if (isRecent) temperature[num].recent++;
    });
  });
  
  Object.keys(temperature).forEach(numStr => {
    const num = parseInt(numStr);
    const data = temperature[num];
    
    const expectedRecent = (data.total / results.length) * recentPeriod;
    data.score = data.recent / expectedRecent;
    
    if (data.score >= 1.5) data.temperature = 'hot';
    else if (data.score >= 1.0) data.temperature = 'warm';
    else if (data.score >= 0.5) data.temperature = 'cold';
    else data.temperature = 'frozen';
  });
  
  return temperature;
};

// 11. Análise de ciclos
export const analyzeCycles = (results: ResultadoHistorico[], maxCycleLength: number = 20) => {
  const numberCycles: Map<number, number[]> = new Map();
  
  for (let num = 1; num <= 25; num++) {
    const positions: number[] = [];
    
    results.forEach((result, index) => {
      const numbers = result.dezenas.split(',').map(Number);
      if (numbers.includes(num)) {
        positions.push(index);
      }
    });
    
    numberCycles.set(num, positions);
  }
  
  const cycleAnalysis = Array.from(numberCycles.entries()).map(([num, positions]) => {
    if (positions.length < 2) return { number: num, avgInterval: Infinity, intervals: [] };
    
    const intervals = positions.slice(1).map((pos, i) => pos - positions[i]);
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    return {
      number: num,
      avgInterval: Math.round(avgInterval),
      intervals,
      lastSeen: positions[positions.length - 1],
      timeSinceLastSeen: results.length - 1 - positions[positions.length - 1],
      predictedNext: positions[positions.length - 1] + Math.round(avgInterval)
    };
  });
  
  return cycleAnalysis.sort((a, b) => a.avgInterval - b.avgInterval);
};

// 12. Análise de correlações
export const findNumberCorrelations = (results: ResultadoHistorico[], minCorrelation: number = 0.3) => {
  const correlations: Map<string, { correlation: number; coOccurrences: number; total: number }> = new Map();
  
  for (let i = 1; i <= 25; i++) {
    for (let j = i + 1; j <= 25; j++) {
      let coOccurrences = 0;
      let num1Occurrences = 0;
      let num2Occurrences = 0;
      
      results.forEach(result => {
        const numbers = result.dezenas.split(',').map(Number);
        const hasNum1 = numbers.includes(i);
        const hasNum2 = numbers.includes(j);
        
        if (hasNum1) num1Occurrences++;
        if (hasNum2) num2Occurrences++;
        if (hasNum1 && hasNum2) coOccurrences++;
      });
      
      const union = num1Occurrences + num2Occurrences - coOccurrences;
      const correlation = union > 0 ? coOccurrences / union : 0;
      
      if (correlation >= minCorrelation) {
        correlations.set(`${i}-${j}`, {
          correlation: Math.round(correlation * 100) / 100,
          coOccurrences,
          total: results.length
        });
      }
    }
  }
  
  return Array.from(correlations.entries())
    .map(([pair, data]) => ({ pair, ...data }))
    .sort((a, b) => b.correlation - a.correlation);
};

// 13. Análise preditiva
export const generatePredictiveInsights = (results: ResultadoHistorico[]) => {
  const recentTrends = analyzeRecentTrends(results, 20);
  const temperature = calculateTemperature(results);
  const cycles = analyzeCycles(results);
  
  const predictions = Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
    const temp = temperature[num];
    const cycle = cycles.find(c => c.number === num);
    const recentFreq = Object.entries(recentTrends.frequencies).find(([n]) => parseInt(n) === num)?.[1] || 0;
    
    let score = 0;
    let reasons: string[] = [];
    
    if (temp.temperature === 'hot') {
      score += 3;
      reasons.push('Número quente');
    } else if (temp.temperature === 'warm') {
      score += 1;
      reasons.push('Número aquecendo');
    }
    
    if (cycle && cycle.timeSinceLastSeen >= cycle.avgInterval * 0.8) {
      score += 2;
      reasons.push('Dentro do ciclo esperado');
    }
    
    if (recentFreq < 10) {
      score += 1;
      reasons.push('Frequência recente baixa');
    }
    
    return {
      number: num,
      score,
      reasons,
      temperature: temp.temperature,
      cycleStatus: cycle ? `${cycle.timeSinceLastSeen}/${cycle.avgInterval}` : 'N/A'
    };
  });
  
  return predictions.sort((a, b) => b.score - a.score);
};

// 14. Relatório consolidado
export const generateComprehensiveReport = (results: ResultadoHistorico[]) => {
  return {
    summary: {
      totalDraws: results.length,
      analyzedPeriod: `${results[0]?.concurso || 'N/A'} - ${results[results.length - 1]?.concurso || 'N/A'}`,
      lastUpdate: new Date().toISOString()
    },
    patterns: {
      sequences: findCommonSequences(results),
      quadrants: calculateQuadrantDistribution(results),
      parity: calculateParityDistribution(results),
      columns: calculateColumnDistribution(results),
      temperature: calculateTemperature(results),
      cycles: analyzeCycles(results),
      correlations: findNumberCorrelations(results)
    },
    insights: {
      recentTrends: analyzeRecentTrends(results),
      predictions: generatePredictiveInsights(results)
    },
    statistics: {
      averageSum: calculateAverageSum(results),
      rareCombinations: findRareCombinations(results)
    }
  };
};

// Exportação explícita de todas as funções
export {
  calculateFrequencies,
  calculateDelayedNumbers,
  findCommonSequences,
  calculateQuadrantDistribution,
  calculateParityDistribution,
  findRareCombinations,
  calculateColumnDistribution,
  calculateAverageSum,
  analyzeRecentTrends,
  calculateTemperature,
  analyzeCycles,
  findNumberCorrelations,
  generatePredictiveInsights,
  generateComprehensiveReport
};