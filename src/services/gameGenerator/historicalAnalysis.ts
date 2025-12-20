// src/services/historicalAnalysis.ts - VERSÃO COMPLETA E ATUALIZADA

import { ResultadoHistorico } from '@/types/generator';

// === FUNÇÕES FUNDAMENTAIS ===

// Calcula frequências de números
export const calculateFrequencies = (results: ResultadoHistorico[]) => {
  const frequencyMap: Record<number, number> = {};
  
  // Inicializa todos os números de 1 a 25
  for (let i = 1; i <= 25; i++) {
    frequencyMap[i] = 0;
  }
  
  // Conta ocorrências
  results.forEach(result => {
    result.dezenas.split(',').map(Number).forEach(num => {
      if (num >= 1 && num <= 25) frequencyMap[num]++;
    });
  });
  
  return Object.entries(frequencyMap)
    .map(([num, count]) => ({
      number: parseInt(num),
      count,
      frequency: (count / results.length) * 100
    }))
    .sort((a, b) => b.count - a.count);
};

// Calcula números atrasados
export const calculateDelayedNumbers = (results: ResultadoHistorico[]) => {
  if (results.length === 0) return [];
  
  const lastDraw = Math.max(...results.map(r => r.concurso));
  const lastSeen: Record<number, number> = {};
  
  // Inicializa todos os números
  for (let i = 1; i <= 25; i++) {
    lastSeen[i] = 0;
  }
  
  // Processa concursos do mais recente para o mais antigo
  const sortedResults = [...results].sort((a, b) => b.concurso - a.concurso);
  
  sortedResults.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number);
    numbers.forEach(num => {
      if (num >= 1 && num <= 25 && lastSeen[num] === 0) {
        lastSeen[num] = result.concurso;
      }
    });
  });
  
  // Calcula atrasos
  const delays: Array<{number: number; delay: number}> = [];
  for (let num = 1; num <= 25; num++) {
    const delay = lastSeen[num] > 0 ? lastDraw - lastSeen[num] : results.length;
    delays.push({ number: num, delay });
  }
  
  return delays.sort((a, b) => b.delay - a.delay);
};

// === FUNÇÕES EXISTENTES APRIMORADAS ===

// 1. Sequências recorrentes com melhor performance e flexibilidade
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

// 2. Distribuição por quadrantes com análise de tendências
export const calculateQuadrantDistribution = (results: ResultadoHistorico[]) => {
  const quadrantData = {
    q1: { count: 0, numbers: new Set<number>(), recent: 0 }, // 1-6
    q2: { count: 0, numbers: new Set<number>(), recent: 0 }, // 7-12
    q3: { count: 0, numbers: new Set<number>(), recent: 0 }, // 13-18
    q4: { count: 0, numbers: new Set<number>(), recent: 0 }  // 19-25
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

// === FUNÇÕES DE DISTRIBUIÇÃO ===

// Distribuição par/ímpar
export const calculateParityDistribution = (results: ResultadoHistorico[]) => {
  let even = 0;
  let odd = 0;
  
  results.forEach(result => {
    result.dezenas.split(',').map(Number).forEach(num => {
      num % 2 === 0 ? even++ : odd++;
    });
  });
  
  const total = even + odd;
  return {
    even: {
      count: even,
      percentage: (even / total) * 100
    },
    odd: {
      count: odd,
      percentage: (odd / total) * 100
    }
  };
};

// Distribuição por colunas (considerando 5 colunas)
export const calculateColumnDistribution = (results: ResultadoHistorico[]) => {
  const columns = Array(5).fill(0).map(() => 0);
  
  results.forEach(result => {
    result.dezenas.split(',').map(Number).forEach(num => {
      const col = (num - 1) % 5;
      columns[col]++;
    });
  });
  
  const total = columns.reduce((sum, count) => sum + count, 0);
  return columns.map((count, index) => ({
    column: index + 1,
    count,
    percentage: (count / total) * 100
  }));
};

// === FUNÇÕES ESTATÍSTICAS ===

// Calcula mediana (função auxiliar)
const calculateMedian = (numbers: number[]) => {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

// Soma média das dezenas
export const calculateAverageSum = (results: ResultadoHistorico[]) => {
  const sums = results.map(result => 
    result.dezenas.split(',').map(Number).reduce((sum, num) => sum + num, 0)
  );
  
  const average = sums.reduce((sum, val) => sum + val, 0) / sums.length;
  return {
    min: Math.min(...sums),
    max: Math.max(...sums),
    average: parseFloat(average.toFixed(2)),
    median: calculateMedian(sums)
  };
};

// Combinações raras
export const findRareCombinations = (
  results: ResultadoHistorico[], 
  minOccurrences: number = 3
) => {
  const combinationMap = new Map<string, number>();
  
  results.forEach(result => {
    const numbers = result.dezenas.split(',').map(Number).sort((a, b) => a - b);
    
    // Todas combinações de 3 números
    for (let i = 0; i < numbers.length - 2; i++) {
      for (let j = i + 1; j < numbers.length - 1; j++) {
        for (let k = j + 1; k < numbers.length; k++) {
          const combination = `${numbers[i]}-${numbers[j]}-${numbers[k]}`;
          combinationMap.set(combination, (combinationMap.get(combination) || 0) + 1);
        }
      }
    }
  });
  
  return Array.from(combinationMap.entries())
    .filter(([_, count]) => count <= minOccurrences)
    .sort((a, b) => a[1] - b[1]);
};

// === ANÁLISE DE TENDÊNCIAS RECENTES ===
export const analyzeRecentTrends = (results: ResultadoHistorico[], lookback: number = 30) => {
  const recentResults = results.slice(-lookback);
  
  return {
    frequencies: calculateFrequencies(recentResults),
    delayedNumbers: calculateDelayedNumbers(recentResults),
    sequences: findCommonSequences(recentResults, 2, 3),
    quadrants: calculateQuadrantDistribution(recentResults),
    parity: calculateParityDistribution(recentResults),
    columns: calculateColumnDistribution(recentResults),
    averageSum: calculateAverageSum(recentResults),
    rareCombinations: findRareCombinations(recentResults)
  };
};

// === NOVAS FUNCIONALIDADES ===

// 8. Análise de ciclos
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

// 9. Análise de temperatura
export const calculateTemperature = (results: ResultadoHistorico[], recentPeriod: number = 15) => {
  const recentResults = results.slice(-recentPeriod);
  const totalResults = results.length;
  
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
    const isRecent = index >= totalResults - recentPeriod;
    
    numbers.forEach(num => {
      temperature[num].total++;
      if (isRecent) temperature[num].recent++;
    });
  });
  
  Object.keys(temperature).forEach(numStr => {
    const num = parseInt(numStr);
    const data = temperature[num];
    
    const expectedRecent = (data.total / totalResults) * recentPeriod;
    data.score = data.recent / expectedRecent;
    
    if (data.score >= 1.5) data.temperature = 'hot';
    else if (data.score >= 1.0) data.temperature = 'warm';
    else if (data.score >= 0.5) data.temperature = 'cold';
    else data.temperature = 'frozen';
  });
  
  return temperature;
};

// 10. Análise de correlações
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

// 11. Análise preditiva
export const generatePredictiveInsights = (results: ResultadoHistorico[]) => {
  const recentTrends = analyzeRecentTrends(results, 20);
  const temperature = calculateTemperature(results);
  const cycles = analyzeCycles(results);
  const correlations = findNumberCorrelations(results);
  
  const predictions = Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
    const temp = temperature[num];
    const cycle = cycles.find(c => c.number === num);
    const recentFreq = recentTrends.frequencies.find(f => f.number === num)?.frequency || 0;
    
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

// 12. Relatório consolidado
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