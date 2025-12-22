/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/page.tsx
 * VERSÃO: 2.4.0 (Full Implementation - No Omissions)
 * DESCRIÇÃO: Container da página Gerador Inteligente. Gerencia autenticação,
 * análise de dados, turbo e lógica de exclusão mútua [cite: 2025-12-14].
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

// =============================================================================
// UTILITÁRIOS E HOOKS AUXILIARES
// =============================================================================

export function hasAccessToResource(
  userPlan: "free" | "basic" | "plus" | "premium",
  requiredPlan: GeneratorType
): boolean {
  const planHierarchy = ["free", "basic", "plus", "premium"];
  return (
    planHierarchy.indexOf(userPlan) >= planHierarchy.indexOf(requiredPlan)
  );
}

const useBlobSound = (soundPath: string) => {
  const [play, setPlay] = useState<() => void>(() => () => {});
  const [userInteracted, setUserInteracted] = useState(false);

  const handleInteraction = useCallback(() => {
    setUserInteracted(true);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [handleInteraction]);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let blobUrl: string | null = null;
    const loadSound = async () => {
      try {
        const response = await fetch(soundPath);
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        audio = new Audio(blobUrl);
        audio.volume = 0.5;
        audio.preload = "auto";
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
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (audio) { audio.pause(); audio.removeAttribute('src'); }
    };
  }, [soundPath, userInteracted]);
  return { play: userInteracted ? play : () => {} };
};

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

// =============================================================================
// COMPONENTE PRINCIPAL (ORQUESTRADOR)
// =============================================================================

export default function GeradorInteligentePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const gameGen = useGameGenerator();

  // --- Estados de Análise e Dados ---
  const [activeTab, setActiveTab] = useState<GeneratorType>("free");
  const [historicos, setHistoricos] = useState<ResultadoHistorico[]>([]);
  const [frequencias, setFrequencias] = useState<any[]>([]);
  const [atrasados, setAtrasados] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "basic" | "plus" | "premium">("free");
  const [currentConcurso, setCurrentConcurso] = useState<number | null>(null);

  // --- Estados de Persistência e UI ---
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [savedGamesRemaining, setSavedGamesRemaining] = useState(0);
  const [savingGameId, setSavingGameId] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  // --- Novo Estado: Toast Contextual ---
  const [toast, setToast] = useState<{ message: string; target: 'fixed' | 'excluded' } | null>(null);

  // --- Estados de Turbo ---
  const [turboUsages, setTurboUsages] = useState(0);
  const [turboLimit, setTurboLimit] = useState(1);
  const [loadingTurbo, setLoadingTurbo] = useState(false);
  const [showPremiumResults, setShowPremiumResults] = useState(false);
  const [premiumResults, setPremiumResults] = useState<any>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [intervalValue, setIntervalValue] = useState(10);

  const { play: playHoverSound } = useBlobSound("/sounds/beep-1.mp3");

  // Timer para limpeza automática do Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Ciclo de Inicialização de Dados
  useEffect(() => {
    async function initializeData() {
      setLoadingData(true);
      try {
        const res = await fetch("/api/resultados");
        const data: ResultadoHistorico[] = await res.json();
        setHistoricos(data);
        if (data.length > 0) {
          const max = data.reduce((acc, h) => (h.concurso > acc ? h.concurso : acc), data[0].concurso);
          setCurrentConcurso(max);
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
          const rawPlan = Array.isArray(dSub) && dSub.length > 0 ? dSub[0].plano.toLowerCase() : "free";
          const mapped = rawPlan === "basico" ? "basic" : rawPlan === "premio" ? "premium" : rawPlan === "plus" ? "plus" : "free";
          setSubscriptionPlan(mapped as any);

          const dSaved = await resSaved.json();
          setSavedGames(dSaved.games || []);
          setSavedGamesRemaining(dSaved.remaining || 0);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoadingData(false);
      }
    }
    initializeData();
  }, [activeTab, isLoggedIn]);

  // Handlers de Negócio
  const handleSaveGame = async (gameNumbers: number[], gameId: number) => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (savedGamesRemaining <= 0) { alert("Limite de jogos salvos atingido!"); return; }
    
    const signature = [...gameNumbers].sort((a, b) => a - b).join(",");
    if (savedGames.some((g) => [...g.numbers].sort((a, b) => a - b).join(",") === signature)) {
      setShowDuplicateAlert(true);
      return;
    }

    setSavingGameId(gameId);
    try {
      const res = await fetch("/api/auth/saved-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ numbers: gameNumbers, concurso: currentConcurso }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const newBet = await res.json();
      setSavedGames(prev => [newBet, ...prev]);
      setSavedGamesRemaining(prev => prev - 1);
    } catch (e) {
      alert("Erro ao salvar jogo.");
    } finally {
      setSavingGameId(null);
    }
  };

  const activeGames = gameGen.batches[activeTab] || [];
  const gamesRemaining = hasAccessToResource(subscriptionPlan, activeTab)
    ? GENERATION_LIMITS[activeTab] - activeGames.length : 0;

  const handleGenerateSingle = () => {
    if (!hasAccessToResource(subscriptionPlan, activeTab) || gamesRemaining <= 0) return;
    gameGen.addGame(activeTab, activeGames, atrasados, frequencias);
  };

  const handleGenerateBatch = () => {
    if (!hasAccessToResource(subscriptionPlan, activeTab) || gamesRemaining <= 0) return;
    gameGen.generateBatch(activeTab, gamesRemaining, activeGames, atrasados, frequencias);
  };

  const handleClearBatch = () => gameGen.clearBatch(activeTab);

  /* -----------------------------------------------------------------------------
   * LÓGICA DE EXCLUSÃO MÚTUA (Mutual Exclusion)
   * Se um número conflita entre cards, ele é movido e um Toast é disparado.
   * ----------------------------------------------------------------------------- */
  const handleSetFixedNumbers = (t: GeneratorType, nums: number[]) => {
    const currentExcluded = gameGen.numberPreferences[t].excluidos;
    const conflicts = currentExcluded.filter(n => nums.includes(n));
    
    if (conflicts.length > 0) {
      const filteredExcluded = currentExcluded.filter(n => !nums.includes(n));
      gameGen.setExcludedNumbers(t, filteredExcluded);
      setToast({ 
        message: `${conflicts.length} nº removido(s) dos EXCLUÍDOS.`, 
        target: 'fixed' 
      });
    }
    gameGen.setFixedNumbers(t, nums);
  };

  const handleSetExcludedNumbers = (t: GeneratorType, nums: number[]) => {
    const currentFixed = gameGen.numberPreferences[t].fixos;
    const conflicts = currentFixed.filter(n => nums.includes(n));

    if (conflicts.length > 0) {
      const filteredFixed = currentFixed.filter(n => !nums.includes(n));
      gameGen.setFixedNumbers(t, filteredFixed);
      setToast({ 
        message: `${conflicts.length} nº removido(s) dos FIXOS.`, 
        target: 'excluded' 
      });
    }
    gameGen.setExcludedNumbers(t, nums);
  };

  // Handlers de Turbo e Análise
  const handleTurbo = async () => {
    setLoadingTurbo(true);
    try {
      const resp = await fetch("/api/turbo-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        alert(err.error || "Limite atingido");
        return;
      }
      const data = await resp.json();
      setTurboUsages(data.usos);
      setTurboLimit(data.limite);

      if (activeTab === "premium") {
        setShowIntervalModal(true);
      } else {
        const qty = activeTab === "free" ? 12 : 30;
        await gameGen.generateBatch(activeTab, qty, activeGames, atrasados, frequencias);
      }
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setLoadingTurbo(false);
    }
  };

  const handlePremiumAnalysis = async () => {
    setShowIntervalModal(false);
    setLoadingTurbo(true);
    try {
      const res = await fetch("/api/analise-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "turbo", quantidadeConcursos: intervalValue }),
      });
      const results = await res.json();
      setPremiumResults(results);
      setShowPremiumResults(true);
    } catch (e: any) {
      alert("Falha na análise.");
    } finally {
      setLoadingTurbo(false);
    }
  };

  const showLoading = useLoadingDelay(loadingData);

  if (showLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white">Carregando inteligência de dados...</span>
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
        toast={toast} // Injeção de feedback visual contextual
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => router.push("/minha-conta/assinaturas")}
        targetPlan={targetPlan}
      />

      <AlertModal
        isOpen={showDuplicateAlert}
        onClose={() => setShowDuplicateAlert(false)}
        title="Jogo Duplicado"
        message="Você já salvou este jogo anteriormente."
        buttonText="Entendi"
        redirectPath="/meus-jogos"
      />

      <TurboResultadosModal
        isOpen={showPremiumResults}
        onClose={() => setShowPremiumResults(false)}
        resultados={premiumResults}
      />

      <InputModal
        isOpen={showIntervalModal}
        onClose={() => setShowIntervalModal(false)}
        onConfirm={handlePremiumAnalysis}
        title="Análise Turbo Premium"
        message="Quantos concursos recentes analisar?"
        inputLabel="Intervalo (3-100)"
        inputValue={intervalValue}
        onInputChange={(e) => setIntervalValue(Math.max(3, Math.min(100, parseInt(e.target.value) || 10)))}
      />
    </>
  );
}