// ====================================================================
// PATH: src/hooks/useGameGenerator.ts
// VERSÃO: 4.0.0 (Full Implementation - Omission-Free & Bug Fixed)
// DESCRIÇÃO: Hook de orquestração do motor de geração de jogos.
// Gerencia estados de progresso, preferências manuais (Plus/Premium) 
// e análise estatística avançada para os cards de interface.
// ====================================================================

import { useState, useEffect, useCallback } from 'react';
import { GeneratorType, GeneratedGame } from '@/types/generator';
import { gerarJogo } from '@/services/gameGenerator';

// --------------------------------------------------------------------
// INTERFACES TÉCNICAS DE DEFINIÇÃO DE DADOS
// --------------------------------------------------------------------
interface NumberPreferences {
  fixos: number[];
  excluidos: number[];
}

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
// MOTOR DE CÁLCULO ESTATÍSTICO (WEIGHTED PROBABILITY ENGINE)
// --------------------------------------------------------------------
const generateWeightedPreferences = (
  historicoConcursos: number[][],
  atrasados: any[],
  frequencias: Record<number, number>
): NumberPreferences => {
  const RANGE_MIN = 1;
  const RANGE_MAX = 25;
  const FIXOS_COUNT = 5;
  const EXCLUIDOS_COUNT = 5;

  const todosNumeros = Array.from({ length: RANGE_MAX - RANGE_MIN + 1 }, (_, i) => i + RANGE_MIN);

  // ============== LÓGICA DE PESO: FREQUÊNCIA (FIXOS) ==============
  const numerosComPesoFrequencia = todosNumeros.map(num => {
    const freq = frequencias[num] || 0;
    const maxFreq = Math.max(...Object.values(frequencias), 1);
    // Escala de peso de 1 a 100 baseada na performance histórica
    const peso = (freq / maxFreq) * 100 + 5;
    return { numero: num, peso };
  });

  const fixos: number[] = [];
  const copiaDisponiveis = [...numerosComPesoFrequencia];

  for (let i = 0; i < FIXOS_COUNT && copiaDisponiveis.length > 0; i++) {
    const somaPesos = copiaDisponiveis.reduce((sum, item) => sum + item.peso, 0);
    let random = Math.random() * somaPesos;
    let selectedIndex = 0;
    
    for (let j = 0; j < copiaDisponiveis.length; j++) {
      random -= copiaDisponiveis[j].peso;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    fixos.push(copiaDisponiveis[selectedIndex].numero);
    copiaDisponiveis.splice(selectedIndex, 1);
  }

  // ============== LÓGICA DE PESO: ATRASO (EXCLUÍDOS) ==============
  const numerosComPesoAtraso = todosNumeros
    .filter(num => !fixos.includes(num))
    .map(num => {
      let atrasoValor = 0;
      if (Array.isArray(atrasados)) {
        const entry = atrasados.find(a => 
          (typeof a === 'object' && a.numero === num) || (typeof a === 'number' && a === num)
        );
        atrasoValor = entry ? (typeof entry === 'object' ? entry.atraso : 1) : 0;
      }
      return { numero: num, peso: atrasoValor + 15 };
    });

  const excluidos: number[] = [];
  const copiaExcluidos = [...numerosComPesoAtraso];

  for (let i = 0; i < EXCLUIDOS_COUNT && copiaExcluidos.length > 0; i++) {
    const somaPesos = copiaExcluidos.reduce((sum, item) => sum + item.peso, 0);
    let random = Math.random() * somaPesos;
    let selectedIndex = 0;
    
    for (let j = 0; j < copiaExcluidos.length; j++) {
      random -= copiaExcluidos[j].peso;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    excluidos.push(copiaExcluidos[selectedIndex].numero);
    copiaExcluidos.splice(selectedIndex, 1);
  }

  return {
    fixos: fixos.sort((a, b) => a - b),
    excluidos: excluidos.sort((a, b) => a - b)
  };
};

// --------------------------------------------------------------------
// CONFIGURAÇÃO INICIAL DO ESTADO
// --------------------------------------------------------------------
const initialState: GameGeneratorState = {
  batches: { free: [], basic: [], plus: [], premium: [] },
  loading: false,
  batchGenerating: false,
  batchProgress: 0,
  error: null,
  numberPreferences: {
    free: { fixos: [], excluidos: [] },
    basic: { fixos: [], excluidos: [] },
    plus: { fixos: [], excluidos: [] },
    premium: { fixos: [], excluidos: [] }
  },
  historicoConcursos: [],
  historicoLoading: true
};

// ====================================================================
// HOOK PRINCIPAL (LOGIC ORCHESTRATOR)
// ====================================================================
export const useGameGenerator = () => {
  const [state, setState] = useState<GameGeneratorState>(initialState);

  // ------------------------------------------------------------------
  // INICIALIZAÇÃO E SINCRONIZAÇÃO DE HISTÓRICO
  // ------------------------------------------------------------------
  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch('/api/resultados');
        if (!response.ok) throw new Error("Database offline");
        const data = await response.json();
        const formatted = data.map((concurso: any) => 
          Array.isArray(concurso.dezenas) ? concurso.dezenas : concurso.dezenas.split(',').map(Number)
        );
        setState(prev => ({ ...prev, historicoConcursos: formatted, historicoLoading: false }));
      } catch (err) {
        setState(prev => ({ ...prev, historicoLoading: false, error: "Erro ao carregar inteligência!" }));
      }
    }
    loadResources();
  }, []);

  // ------------------------------------------------------------------
  // CONTROLE DE AUTOMAÇÃO POR PLANO
  // ------------------------------------------------------------------
  const shouldApplyAutoPreferences = (type: GeneratorType): boolean => {
    // Plus agora permite controle manual, portanto retorna false aqui
    return type === 'free' || type === 'basic';
  };

  // ------------------------------------------------------------------
  // GETTER DE PREFERÊNCIAS (FIX PARA O ERRO DE ESTRATÉGIA)
  // ------------------------------------------------------------------
  const getPreferencesForGeneration = (
    type: GeneratorType,
    atrasados: any[],
    frequencias: Record<number, number>
  ): NumberPreferences => {
    const manual = state.numberPreferences[type];
    const auto = generateWeightedPreferences(state.historicoConcursos, atrasados, frequencias);

    if (type === 'premium') return manual;
    if (type === 'plus') {
      return {
        fixos: manual.fixos.length > 0 ? manual.fixos : auto.fixos,
        excluidos: auto.excluidos
      };
    }
    return auto;
  };

  // ------------------------------------------------------------------
  // ADICIONAR JOGO INDIVIDUAL (SINGLE GENERATION)
  // ------------------------------------------------------------------
  const addGame = (
    type: GeneratorType,
    existingGames: GeneratedGame[],
    atrasados: any[],
    frequencias: Record<number, number>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    setTimeout(() => {
      const prefs = getPreferencesForGeneration(type, atrasados, frequencias);
      
      // FIX CRÍTICO: Objeto de opções obrigatório para evitar Uncaught Error
      const strategyOptions = { 
        historicoConcursos: state.historicoConcursos, 
        quantidadeJogos: 1 
      };

      const newGame = gerarJogo(
        type, 
        existingGames, 
        atrasados, 
        frequencias, 
        prefs, 
        state.historicoConcursos,
        strategyOptions // Passagem explícita para evitar o erro informado
      );

      if (!newGame) {
        setState(prev => ({ ...prev, loading: false, error: 'Falha técnica na geração.' }));
        return;
      }

      setState(prev => ({
        ...prev,
        batches: { ...prev.batches, [type]: [...(prev.batches[type] || []), newGame] },
        loading: false
      }));
    }, 400);
  };

  // ------------------------------------------------------------------
  // GERAÇÃO EM LOTE (BATCH GENERATION COM ANIMAÇÃO DE PROGRESSO)
  // ------------------------------------------------------------------
  const generateBatch = (
    type: GeneratorType,
    batchSize: number,
    existingGames: GeneratedGame[],
    atrasados: any[],
    frequencias: Record<number, number>
  ) => {
    setState(prev => ({ ...prev, batchGenerating: true, batchProgress: 0, error: null }));

    const prefs = getPreferencesForGeneration(type, atrasados, frequencias);
    let batch: GeneratedGame[] = [];
    let cumulativeGames = [...existingGames];

    const processor = (index: number) => {
      if (index >= batchSize) {
        setState(prev => ({
          ...prev,
          batches: { ...prev.batches, [type]: [...(prev.batches[type] || []), ...batch] },
          batchGenerating: false,
          batchProgress: 100
        }));
        return;
      }

      // Para 'free'/'basic', gera novas preferências a cada iteração para diversidade
      const currentPrefs = shouldApplyAutoPreferences(type) 
        ? generateWeightedPreferences(state.historicoConcursos, atrasados, frequencias) 
        : prefs;

      const g = gerarJogo(
        type, 
        cumulativeGames, 
        atrasados, 
        frequencias, 
        currentPrefs, 
        state.historicoConcursos,
        { historicoConcursos: state.historicoConcursos, quantidadeJogos: 1 }
      );

      if (g) {
        batch.push(g);
        cumulativeGames.push(g);
      }

      setState(prev => ({ ...prev, batchProgress: Math.floor(((index + 1) / batchSize) * 100) }));
      setTimeout(() => processor(index + 1), 60);
    };

    processor(0);
  };

  // ------------------------------------------------------------------
  // SETTERS DE PREFERÊNCIAS (MODIFICADO PARA SUPORTAR PLANO PLUS)
  // ------------------------------------------------------------------
  const setFixedNumbers = (type: GeneratorType, fixos: number[]) => {
    if (type === 'premium' || type === 'plus') {
      setState(prev => ({
        ...prev,
        numberPreferences: {
          ...prev.numberPreferences,
          [type]: { ...prev.numberPreferences[type], fixos }
        }
      }));
    }
  };

  const setExcludedNumbers = (type: GeneratorType, excluidos: number[]) => {
    if (type === 'premium') {
      setState(prev => ({
        ...prev,
        numberPreferences: {
          ...prev.numberPreferences,
          premium: { ...prev.numberPreferences.premium, excluidos }
        }
      }));
    }
  };

  // ------------------------------------------------------------------
  // GETTER DE INTERFACE (VISUAL SYNC)
  // ------------------------------------------------------------------
  const getCurrentPreferences = (
    type: GeneratorType,
    atrasados: any[],
    frequencias: Record<number, number>
  ): NumberPreferences => {
    if (type === 'premium' || type === 'plus') {
      return state.numberPreferences[type];
    }
    return generateWeightedPreferences(state.historicoConcursos, atrasados, frequencias);
  };

  // ------------------------------------------------------------------
  // FUNÇÕES DE MANUTENÇÃO DE ESTADO (CLEANERS)
  // ------------------------------------------------------------------
  const clearBatch = (type: GeneratorType) => {
    setState(prev => ({ ...prev, batches: { ...prev.batches, [type]: [] } }));
  };

  const clearBatches = () => {
    setState(prev => ({ ...prev, batches: initialState.batches }));
  };

  const resetPreferences = () => {
    setState(prev => ({
      ...prev,
      numberPreferences: {
        ...prev.numberPreferences,
        premium: { fixos: [], excluidos: [] },
        plus: { fixos: [], excluidos: [] }
      }
    }));
  };

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  return {
    ...state,
    addGame,
    generateBatch,
    setFixedNumbers,
    setExcludedNumbers,
    getCurrentPreferences,
    shouldApplyAutoPreferences,
    clearBatch,
    clearBatches,
    resetPreferences
  };
};