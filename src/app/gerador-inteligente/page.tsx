/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/page.tsx
 * VERSÃO: 4.6.0 (Ajuste de Usabilidade e Restauração de Texto)
 * DESCRIÇÃO: Orquestrador da página Gerador Inteligente. Gerencia estados de 
 * análise, autenticação, turbo e a lógica de limites de geração.
 * ============================================================================= */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGameGenerator } from "@/hooks/useGameGenerator";
import { GeneratorType, ResultadoHistorico } from "@/types/generator";
import { GENERATION_LIMITS } from "@/utils/constants";
import GeradorInteligenteView from "./GeradorInteligenteView";
import {
  calculateFrequencies,
  calculateDelayedNumbers,
} from "@/services/gameGenerator/historicalAnalysis";
import UpgradeModal from "@/components/ui/UpgradeModal";
import AlertModal from "@/components/ui/AlertModal";
import TurboResultadosModal from "@/components/ui/TurboResultadosModal";
import InputModal from "@/components/ui/InputModal";

/**
 * Utilitário de Hierarquia de Planos para controle de acesso
 */
export function hasAccessToResource(
  userPlan: "free" | "basic" | "plus" | "premium",
  requiredPlan: GeneratorType
): boolean {
  const planHierarchy = ["free", "basic", "plus", "premium"];
  const userIdx = planHierarchy.indexOf(userPlan);
  const reqIdx = planHierarchy.indexOf(requiredPlan);
  return userIdx >= reqIdx;
}

/**
 * Hook para reprodução de sons via Blob para alta performance
 */
const useBlobSound = (soundPath: string) => {
  const [play, setPlay] = useState<() => void>(() => () => {});
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    const loadSound = async () => {
      try {
        const response = await fetch(soundPath);
        const blob = await response.blob();
        audio = new Audio(URL.createObjectURL(blob));
        audio.volume = 0.5;
        setPlay(() => () => {
          if (audio && userInteracted) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Erro áudio:", e));
          }
        });
      } catch (error) {
        console.error("Erro ao carregar áudio:", error);
      }
    };
    loadSound();
  }, [soundPath, userInteracted]);
  return { play };
};

/**
 * Hook para controle de delay visual no carregamento (UX)
 */
function useLoadingDelay(loadingFlag: boolean) {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    if (!loadingFlag) {
      const timer = setTimeout(() => setShowLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loadingFlag]);
  return showLoading && loadingFlag;
}

export default function GeradorInteligentePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const gameGen = useGameGenerator();

  // --- Estados de Algoritmo e Dados ---
  const [activeTab, setActiveTab] = useState<GeneratorType>("free");
  const [historicos, setHistoricos] = useState<ResultadoHistorico[]>([]);
  const [frequencias, setFrequencias] = useState<any[]>([]);
  const [atrasados, setAtrasados] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "basic" | "plus" | "premium">("free");
  const [currentConcurso, setCurrentConcurso] = useState<number | null>(null);

  // --- Estados de UI e Feedback ---
  const [toast, setToast] = useState<{ message: string; target: 'fixed' | 'excluded' } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  // --- Estados de Persistência ---
  const [savedGamesRemaining, setSavedGamesRemaining] = useState(0);
  const [savingGameId, setSavingGameId] = useState<number | null>(null);

  // --- Estados de Turbo e Análise ---
  const [turboUsages, setTurboUsages] = useState(0);
  const [turboLimit, setTurboLimit] = useState(1);
  const [loadingTurbo, setLoadingTurbo] = useState(false);
  const [showPremiumResults, setShowPremiumResults] = useState(false);
  const [premiumResults, setPremiumResults] = useState<any>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [intervalValue, setIntervalValue] = useState(10);

  const { play: playHoverSound } = useBlobSound("/sounds/beep-1.mp3");

  // Limpeza automática do Toast de conflito
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Inicialização do Banco de Dados Local e Perfil
  useEffect(() => {
    async function init() {
      setLoadingData(true);
      try {
        const res = await fetch("/api/resultados");
        const data = await res.json();
        setHistoricos(data);
        if (data.length > 0) {
          setCurrentConcurso(Math.max(...data.map((h: any) => h.concurso)));
        }
        setFrequencias(calculateFrequencies(data));
        setAtrasados(calculateDelayedNumbers(data));

        if (isLoggedIn) {
          const [resTurbo, resSub, resSaved] = await Promise.all([
            fetch(`/api/turbo-usage?tab=${activeTab}`),
            fetch("/api/auth/subscriptions", { credentials: "include" }),
            fetch("/api/auth/saved-games", { credentials: "include" })
          ]);
          
          const dTurbo = await resTurbo.json();
          setTurboUsages(dTurbo.usos);
          setTurboLimit(dTurbo.limite);

          const dSub = await resSub.json();
          const raw = Array.isArray(dSub) && dSub.length > 0 ? dSub[0].plano.toLowerCase() : "free";
          const mapped = (raw === "basico" || raw === "basic") ? "basic" : 
                         (raw === "premio" || raw === "premium") ? "premium" : 
                         (raw === "plus") ? "plus" : "free";
          setSubscriptionPlan(mapped as any);

          const dSaved = await resSaved.json();
          setSavedGamesRemaining(dSaved.remaining || 0);
        }
      } catch (err) {
        console.error("Erro init:", err);
      } finally {
        setLoadingData(false);
      }
    }
    init();
  }, [activeTab, isLoggedIn]);

  // Handlers de Salvamento
  const handleSaveGame = async (gameNumbers: number[], gameId: number) => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (savedGamesRemaining <= 0) { alert("Limite de salvamento atingido!"); return; }
    
    setSavingGameId(gameId);
    try {
      const res = await fetch("/api/auth/saved-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: gameNumbers, concurso: currentConcurso }),
      });
      if (res.ok) {
        setSavedGamesRemaining(prev => prev - 1);
      } else if (res.status === 409) {
        setShowDuplicateAlert(true);
      }
    } catch (e) {
      alert("Erro ao salvar jogo.");
    } finally {
      setSavingGameId(null);
    }
  };

  const activeGames = gameGen.batches[activeTab] || [];
  const gamesRemaining = hasAccessToResource(subscriptionPlan, activeTab) 
    ? GENERATION_LIMITS[activeTab] - activeGames.length : 0;

  // REQUISITO 2: Desativar handlers se gamesRemaining for 0
  const handleGenerateSingle = () => {
    if (!hasAccessToResource(subscriptionPlan, activeTab) || gamesRemaining <= 0) return;
    gameGen.addGame(activeTab, activeGames, atrasados, frequencias);
  };

  const handleGenerateBatch = () => {
    if (!hasAccessToResource(subscriptionPlan, activeTab) || gamesRemaining <= 0) return;
    gameGen.generateBatch(activeTab, gamesRemaining, activeGames, atrasados, frequencias);
  };

  // REQUISITO 3: Limpar lote reativa automaticamente gamesRemaining
  const handleClearBatch = () => {
    gameGen.clearBatch(activeTab);
  };

  /* -----------------------------------------------------------------------------
   * LÓGICA DE EXCLUSÃO MÚTUA (Mutual Exclusion)
   * ----------------------------------------------------------------------------- */
  const handleSetFixedNumbers = (t: GeneratorType, nums: number[]) => {
    const prefs = gameGen.numberPreferences[t] || { fixos: [], excluidos: [] };
    const currentExcluded = prefs.excluidos || [];
    const conflicts = currentExcluded.filter(n => nums.includes(n));
    
    if (conflicts.length > 0) {
      const filteredExcluded = currentExcluded.filter(n => !nums.includes(n));
      gameGen.setExcludedNumbers(t, filteredExcluded);
      setToast({ message: `${conflicts.length} nº movido(s) para FIXOS.`, target: 'fixed' });
    }
    gameGen.setFixedNumbers(t, nums);
  };

  const handleSetExcludedNumbers = (t: GeneratorType, nums: number[]) => {
    const prefs = gameGen.numberPreferences[t] || { fixos: [], excluidos: [] };
    const currentFixed = prefs.fixos || [];
    const conflicts = currentFixed.filter(n => nums.includes(n));
    
    if (conflicts.length > 0) {
      const filteredFixed = currentFixed.filter(n => !nums.includes(n));
      gameGen.setFixedNumbers(t, filteredFixed);
      setToast({ message: `${conflicts.length} nº movido(s) para EXCLUÍDOS.`, target: 'excluded' });
    }
    gameGen.setExcludedNumbers(t, nums);
  };

  const handleTurbo = async () => {
    setLoadingTurbo(true);
    try {
      const resp = await fetch("/api/turbo-usage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab }),
      });
      if (!resp.ok) return;
      const data = await resp.json();
      setTurboUsages(data.usos);
      setTurboLimit(data.limite);
      if (activeTab !== "premium") {
        const qty = activeTab === "free" ? 12 : 30;
        await gameGen.generateBatch(activeTab, qty, activeGames, atrasados, frequencias);
      }
    } catch (e) { console.error(e); } finally { setLoadingTurbo(false); }
  };

  const showLoading = useLoadingDelay(loadingData);

  /* -----------------------------------------------------------------------------
   * REQUISITO 1: INTRODUÇÃO (TEXTO ORIGINAL RESTAURADO)
   * ----------------------------------------------------------------------------- */
  if (showLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white mb-2">Gerador Inteligente</span>
        <span className="text-lg text-gray-300 mb-1">Carregando dados estratégicos…</span>
        <span className="text-sm text-gray-500">Aguarde, pode demorar alguns segundos :)</span>
      </div>
    );
  }

  return (
    <>
      <GeradorInteligenteView
        {...gameGen}
        activeTab={activeTab}
        setActiveTab={(t) => hasAccessToResource(subscriptionPlan, t) ? setActiveTab(t) : (setTargetPlan(t), setShowUpgradeModal(true))}
        isLoggedIn={isLoggedIn}
        user={user}
        subscriptionPlan={subscriptionPlan}
        activeGames={activeGames}
        gamesRemaining={gamesRemaining}
        historicos={historicos}
        loadingData={loadingData}
        playHoverSound={playHoverSound}
        handleGenerateSingle={handleGenerateSingle}
        handleGenerateBatch={handleGenerateBatch}
        handleClearBatch={handleClearBatch}
        handleSetFixedNumbers={handleSetFixedNumbers}
        handleSetExcludedNumbers={handleSetExcludedNumbers}
        savedGamesRemaining={savedGamesRemaining}
        onSaveGame={handleSaveGame}
        savingGameId={savingGameId}
        onTurbo={handleTurbo}
        turboUsages={turboUsages}
        turboLimit={turboLimit}
        loadingTurbo={loadingTurbo}
        toast={toast}
      />

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} onUpgrade={() => router.push("/minha-conta/assinaturas")} targetPlan={targetPlan} />
      <AlertModal isOpen={showDuplicateAlert} onClose={() => setShowDuplicateAlert(false)} title="Jogo Duplicado" message="Este jogo já foi salvo anteriormente." buttonText="Entendi" redirectPath="/meus-jogos" />
      <TurboResultadosModal isOpen={showPremiumResults} onClose={() => setShowPremiumResults(false)} resultados={premiumResults} />
      <InputModal isOpen={showIntervalModal} onClose={() => setShowIntervalModal(false)} onConfirm={() => {}} title="Análise Turbo" message="Selecione o intervalo." inputLabel="Intervalo" inputValue={intervalValue} onInputChange={(e) => setIntervalValue(parseInt(e.target.value))} />
    </>
  );
}