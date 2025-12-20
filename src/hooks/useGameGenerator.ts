// ====================================================================
// PATH: src/hooks/useGameGenerator.ts
// ====================================================================

import { useState, useEffect } from 'react';
import { GeneratorType, GeneratedGame } from '@/types/generator';
import { gerarJogo } from '@/services/gameGenerator';

// --------------------------------------------------------------------
// INTERFACE DAS PREFERÊNCIAS NUMÉRICAS
// --------------------------------------------------------------------
interface NumberPreferences {
  fixos: number[];
  excluidos: number[];
}

// --------------------------------------------------------------------
// INTERFACE DO ESTADO PRINCIPAL DO HOOK
// --------------------------------------------------------------------
interface GameGeneratorState {
  batches: Record<GeneratorType, GeneratedGame[]>;
  loading: boolean;
  batchGenerating: boolean;
  batchProgress: number;
  error: string | null;
  numberPreferences: Record<GeneratorType, NumberPreferences>;
  historicoConcursos: number[][];
  historicoLoading: boolean;
}

// --------------------------------------------------------------------
// FUNÇÃO PARA GERAR PREFERÊNCIAS AUTOMÁTICAS COM PESO ESTATÍSTICO
// --------------------------------------------------------------------
const generateWeightedPreferences = (
  historicoConcursos: number[][],
  atrasados: number[],
  frequencias: Record<number, number>
): NumberPreferences => {
  const RANGE_MIN = 1;
  const RANGE_MAX = 25;
  const FIXOS_COUNT = 5;
  const EXCLUIDOS_COUNT = 5;

  // Criar array de números no intervalo
  const todosNumeros = Array.from({ length: RANGE_MAX - RANGE_MIN + 1 }, (_, i) => i + RANGE_MIN);

  // ============== SELEÇÃO DE NÚMEROS FIXOS ==============
  // Peso baseado na frequência (números mais frequentes têm maior chance)
  const numerosComPesoFrequencia = todosNumeros.map(num => {
    const freq = frequencias[num] || 0;
    const maxFreq = Math.max(...Object.values(frequencias));
    const peso = maxFreq > 0 ? (freq / maxFreq) * 100 : 1;
    return { numero: num, peso };
  });

  // Seleção ponderada para números fixos
  const fixos: number[] = [];
  const numerosDisponiveis = [...numerosComPesoFrequencia];

  for (let i = 0; i < FIXOS_COUNT && numerosDisponiveis.length > 0; i++) {
    // Calcular soma total dos pesos
    const somaPesos = numerosDisponiveis.reduce((sum, item) => sum + item.peso, 0);
    
    // Gerar número aleatório baseado no peso
    let random = Math.random() * somaPesos;
    let selectedIndex = 0;
    
    for (let j = 0; j < numerosDisponiveis.length; j++) {
      random -= numerosDisponiveis[j].peso;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    const numeroSelecionado = numerosDisponiveis[selectedIndex];
    fixos.push(numeroSelecionado.numero);
    numerosDisponiveis.splice(selectedIndex, 1);
  }

  // ============== SELEÇÃO DE NÚMEROS EXCLUÍDOS ==============
  // Peso baseado no atraso (números mais atrasados têm maior chance)
  const numerosComPesoAtraso = todosNumeros
    .filter(num => !fixos.includes(num)) // Excluir números já fixos
    .map(num => {
      // Encontrar atraso do número
      let atraso = 0;
      if (Array.isArray(atrasados)) {
        const itemAtraso = atrasados.find(item => 
          (typeof item === 'object' && 'numero' in item && item.numero === num) ||
          (typeof item === 'number' && item === num)
        );
        
        if (itemAtraso) {
          atraso = typeof itemAtraso === 'object' && 'atraso' in itemAtraso 
            ? itemAtraso.atraso 
            : 1;
        }
      }
      
      // Calcular peso (maior atraso = maior peso)
      const maxAtraso = Math.max(...atrasados.map(item => 
        typeof item === 'object' && 'atraso' in item ? item.atraso : 1
      ), 1);
      const peso = maxAtraso > 0 ? (atraso / maxAtraso) * 100 + 10 : 10; // +10 para peso mínimo
      
      return { numero: num, peso };
    });

  // Seleção ponderada para números excluídos
  const excluidos: number[] = [];
  const numerosDisponiveisExcluidos = [...numerosComPesoAtraso];

  for (let i = 0; i < EXCLUIDOS_COUNT && numerosDisponiveisExcluidos.length > 0; i++) {
    const somaPesos = numerosDisponiveisExcluidos.reduce((sum, item) => sum + item.peso, 0);
    let random = Math.random() * somaPesos;
    let selectedIndex = 0;
    
    for (let j = 0; j < numerosDisponiveisExcluidos.length; j++) {
      random -= numerosDisponiveisExcluidos[j].peso;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    const numeroSelecionado = numerosDisponiveisExcluidos[selectedIndex];
    excluidos.push(numeroSelecionado.numero);
    numerosDisponiveisExcluidos.splice(selectedIndex, 1);
  }

  // ============== COMPLETAR SE NECESSÁRIO ==============
  // Completar fixos se não conseguiu 5
  while (fixos.length < FIXOS_COUNT) {
    const disponiveisFixos = todosNumeros.filter(n => 
      !fixos.includes(n) && !excluidos.includes(n)
    );
    if (disponiveisFixos.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * disponiveisFixos.length);
    fixos.push(disponiveisFixos[randomIndex]);
  }

  // Completar excluídos se não conseguiu 5
  while (excluidos.length < EXCLUIDOS_COUNT) {
    const disponiveisExcluidos = todosNumeros.filter(n => 
      !fixos.includes(n) && !excluidos.includes(n)
    );
    if (disponiveisExcluidos.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * disponiveisExcluidos.length);
    excluidos.push(disponiveisExcluidos[randomIndex]);
  }

  return {
    fixos: fixos.sort((a, b) => a - b),
    excluidos: excluidos.sort((a, b) => a - b)
  };
};

// --------------------------------------------------------------------
// FUNÇÃO PARA VERIFICAR SE DEVE APLICAR PREFERÊNCIAS AUTOMÁTICAS
// --------------------------------------------------------------------
const shouldApplyAutoPreferences = (type: GeneratorType): boolean => {
  return type !== 'premium'; // Todos exceto premium
};

// --------------------------------------------------------------------
// ESTADO INICIAL DO HOOK
// --------------------------------------------------------------------
const initialState: GameGeneratorState = {
  batches: {
    free: [],
    basic: [],
    plus: [],
    premium: []
  },
  loading: false,
  batchGenerating: false,
  batchProgress: 0,
  error: null,
  numberPreferences: {
    basic: { fixos: [], excluidos: [] },
    plus: { fixos: [], excluidos: [] },
    premium: { fixos: [], excluidos: [] },
    free: { fixos: [], excluidos: [] }
  },
  historicoConcursos: [],
  historicoLoading: true
};

// ====================================================================
// HOOK PRINCIPAL
// ====================================================================
export const useGameGenerator = () => {
  const [state, setState] = useState<GameGeneratorState>(initialState);

  // ------------------------------------------------------------------
  // BUSCAR HISTÓRICO DE CONCURSOS DA API
  // ------------------------------------------------------------------
  useEffect(() => {
    async function fetchHistorico() {
      setState(prev => ({ ...prev, historicoLoading: true }));
      try {
        const res = await fetch('/api/resultados');
        if (!res.ok) throw new Error('Erro ao buscar concursos');
        const data = await res.json();
        const historicoConcursos = data.map((item: any) =>
          typeof item.dezenas === 'string'
            ? item.dezenas.split(',').map(Number)
            : item.dezenas
        );
        setState(prev => ({
          ...prev,
          historicoConcursos,
          historicoLoading: false
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          historicoConcursos: [],
          historicoLoading: false,
          error: 'Erro ao buscar histórico dos concursos!'
        }));
      }
    }
    fetchHistorico();
  }, []);

  // ------------------------------------------------------------------
  // OBTER PREFERÊNCIAS PARA GERAÇÃO (automáticas ou manuais)
  // ------------------------------------------------------------------
  const getPreferencesForGeneration = (
    type: GeneratorType,
    atrasados: number[],
    frequencias: Record<number, number>
  ): NumberPreferences => {
    if (shouldApplyAutoPreferences(type)) {
      // Para free, basic e plus: sempre gerar preferências automáticas
      return generateWeightedPreferences(
        state.historicoConcursos,
        atrasados,
        frequencias
      );
    } else {
      // Para premium: usar preferências manuais do usuário
      return state.numberPreferences[type];
    }
  };

  // ------------------------------------------------------------------
  // ADICIONAR UM JOGO
  // ------------------------------------------------------------------
  const addGame = (
    type: GeneratorType,
    existingGames: GeneratedGame[],
    atrasados: number[],
    frequencias: Record<number, number>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    setTimeout(() => {
      // Obter preferências (automáticas ou manuais conforme o tipo)
      const preferencesToUse = getPreferencesForGeneration(type, atrasados, frequencias);

      const newGame = gerarJogo(
        type,
        existingGames,
        atrasados,
        frequencias,
        preferencesToUse,
        state.historicoConcursos,
        type === 'free' ? { 
          historicoConcursos: state.historicoConcursos,
          quantidadeJogos: 1
        } : undefined
      );

      if (!newGame) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Não foi possível gerar um jogo novo!'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        batches: {
          ...prev.batches,
          [type]: [...(prev.batches[type] ?? []), newGame]
        },
        loading: false
      }));
    }, 500);
  };

  // ------------------------------------------------------------------
  // GERAR LOTE DE JOGOS
  // ------------------------------------------------------------------
  const generateBatch = (
    type: GeneratorType,
    batchSize: number,
    existingGames: GeneratedGame[],
    atrasados: number[],
    frequencias: Record<number, number>
  ) => {
    setState(prev => ({
      ...prev,
      batchGenerating: true,
      batchProgress: 0,
      error: null
    }));

    // Obter preferências (automáticas ou manuais conforme o tipo)
    const preferencesToUse = getPreferencesForGeneration(type, atrasados, frequencias);

    let batch: GeneratedGame[] = [];
    let allExisting = [...existingGames];

    const generateNext = (count: number) => {
      if (count >= batchSize) {
        setState(prev => ({
          ...prev,
          batches: {
            ...prev.batches,
            [type]: [...(prev.batches[type] ?? []), ...batch]
          },
          batchGenerating: false,
          batchProgress: 100
        }));
        return;
      }

      // Para níveis não-premium, gerar novas preferências a cada jogo para variedade
      const currentPreferences = shouldApplyAutoPreferences(type)
        ? generateWeightedPreferences(state.historicoConcursos, atrasados, frequencias)
        : preferencesToUse;

      const newGame = gerarJogo(
        type,
        allExisting,
        atrasados,
        frequencias,
        currentPreferences,
        state.historicoConcursos,
        type === 'free' ? { 
          historicoConcursos: state.historicoConcursos,
          quantidadeJogos: 1
        } : undefined
      );

      if (!newGame) {
        setState(prev => ({
          ...prev,
          batchGenerating: false,
          error: 'Não foi possível gerar todos os jogos do lote!'
        }));
        return;
      }

      batch.push(newGame);
      allExisting.push(newGame);

      setState(prev => ({
        ...prev,
        batchProgress: Math.floor(((count + 1) / batchSize) * 100)
      }));

      setTimeout(() => generateNext(count + 1), 50);
    };

    generateNext(0);
  };

  // ------------------------------------------------------------------
  // ATUALIZA NÚMEROS FIXOS E EXCLUÍDOS (APENAS PARA PREMIUM)
  // ------------------------------------------------------------------
  const setFixedNumbers = (type: GeneratorType, fixos: number[]) => {
    // Só permite alteração manual para premium
    if (type === 'premium') {
      setState(prev => ({
        ...prev,
        numberPreferences: {
          ...prev.numberPreferences,
          [type]: {
            ...prev.numberPreferences[type],
            fixos
          }
        }
      }));
    }
  };

  const setExcludedNumbers = (type: GeneratorType, excluidos: number[]) => {
    // Só permite alteração manual para premium
    if (type === 'premium') {
      setState(prev => ({
        ...prev,
        numberPreferences: {
          ...prev.numberPreferences,
          [type]: {
            ...prev.numberPreferences[type],
            excluidos
          }
        }
      }));
    }
  };

  // ------------------------------------------------------------------
  // OBTER PREFERÊNCIAS ATUAIS PARA EXIBIÇÃO
  // ------------------------------------------------------------------
  const getCurrentPreferences = (
    type: GeneratorType,
    atrasados: number[],
    frequencias: Record<number, number>
  ): NumberPreferences => {
    if (shouldApplyAutoPreferences(type)) {
      // Para exibição em tempo real das preferências automáticas
      return generateWeightedPreferences(
        state.historicoConcursos,
        atrasados,
        frequencias
      );
    } else {
      return state.numberPreferences[type];
    }
  };

  // ------------------------------------------------------------------
  // LIMPA O LOTE DA ABA ATIVA
  // ------------------------------------------------------------------
  const clearBatch = (type: GeneratorType) => {
    setState(prev => ({
      ...prev,
      batches: {
        ...prev.batches,
        [type]: []
      }
    }));
  };

  // ------------------------------------------------------------------
  // LIMPA TODOS OS LOTES
  // ------------------------------------------------------------------
  const clearBatches = () => {
    setState(prev => ({
      ...prev,
      batches: {
        free: [],
        basic: [],
        plus: [],
        premium: []
      }
    }));
  };

  // ------------------------------------------------------------------
  // RESETAR AS PREFERÊNCIAS (APENAS PREMIUM)
  // ------------------------------------------------------------------
  const resetPreferences = () => {
    setState(prev => ({
      ...prev,
      numberPreferences: {
        ...prev.numberPreferences,
        premium: { fixos: [], excluidos: [] }
      }
    }));
  };

  // ------------------------------------------------------------------
  // RETORNO DO HOOK
  // ------------------------------------------------------------------
  return {
    ...state,
    addGame,
    generateBatch,
    setFixedNumbers,      // Só funciona para premium
    setExcludedNumbers,   // Só funciona para premium
    getCurrentPreferences, // Para exibir preferências atuais
    shouldApplyAutoPreferences, // Para verificar se é automático
    clearBatch,
    clearBatches,
    resetPreferences
  };
};