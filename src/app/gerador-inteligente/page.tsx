/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/page.tsx
 * DESCRIÇÃO: Container da página Gerador Inteligente – integração total com backend para o uso diário do Turbo (App Router).
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
  const [audioReady, setAudioReady] = useState(false);
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
            audio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
          }
        });
        setAudioReady(true);
      } catch (error) {
        console.error("Erro ao carregar áudio:", error);
      }
    };
    loadSound();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    };
  }, [soundPath, userInteracted]);
  return { play: userInteracted ? play : () => {}, audioReady };
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

export default function GeradorInteligentePage() {
  const DEBUG = false;
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const gameGen = useGameGenerator();

  const [activeTab, setActiveTab] = useState<GeneratorType>("free");
  const [historicos, setHistoricos] = useState<ResultadoHistorico[]>([]);
  const [frequencias, setFrequencias] = useState<any[]>([]);
  const [atrasados, setAtrasados] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "basic" | "plus" | "premium">("free");

  const { play: playHoverSound, audioReady } = useBlobSound("/sounds/beep-1.mp3");
  const [currentConcurso, setCurrentConcurso] = useState<number | null>(null);

  interface SavedBet {
    id: number;
    concurso: number;
    numbers: number[];
    createdAt: string;
  }
  const [savedGames, setSavedGames] = useState<SavedBet[]>([]);
  const [savedGamesRemaining, setSavedGamesRemaining] = useState(0);
  const [savingGameId, setSavingGameId] = useState<number | null>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  const [turboUsages, setTurboUsages] = useState(0);
  const [turboLimit, setTurboLimit] = useState(1);
  const [loadingTurbo, setLoadingTurbo] = useState(false);

  const [showPremiumResults, setShowPremiumResults] = useState(false);
  const [premiumResults, setPremiumResults] = useState<any>(null);

  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [intervalValue, setIntervalValue] = useState(10);

  useEffect(() => {
    async function fetchTurboUsage() {
      if (!isLoggedIn) {
        setTurboUsages(0);
        setTurboLimit(1);
        return;
      }
      setLoadingTurbo(true);
      try {
        const res = await fetch(`/api/turbo-usage?tab=${activeTab}`);
        const data = await res.json();
        setTurboUsages(data.usos);
        setTurboLimit(data.limite);
      } catch {
        setTurboUsages(0);
        setTurboLimit(1);
      }
      setLoadingTurbo(false);
    }
    fetchTurboUsage();
  }, [activeTab, isLoggedIn, subscriptionPlan]);

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      try {
        const res = await fetch("/api/resultados");
        const data: ResultadoHistorico[] = await res.json();
        setHistoricos(data);
        if (data.length > 0) {
          const max = data.reduce(
            (acc, h) => (h.concurso > acc ? h.concurso : acc),
            data[0].concurso
          );
          setCurrentConcurso(max);
        }
        setFrequencias(calculateFrequencies(data));
        setAtrasados(calculateDelayedNumbers(data));
      } catch (err) {
        DEBUG && console.error(err);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/subscriptions", { credentials: "include" });
        const subs = await res.json();
        const raw =
          Array.isArray(subs) && subs.length > 0 ? subs[0].plano.toLowerCase() : "free";
        const mapped =
          raw === "basico" ? "basic" : raw === "premio" ? "premium" : raw === "plus" ? "plus" : "free";
        setSubscriptionPlan(mapped as any);
      } catch {
        setSubscriptionPlan("free");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch("/api/auth/saved-games", { credentials: "include" });
        const data = await res.json();
        setSavedGames(data.games || []);
        setSavedGamesRemaining(data.remaining || 0);
      } catch (err) {
        console.error("Erro ao carregar jogos salvos:", err);
      }
    })();
  }, [isLoggedIn, subscriptionPlan]);

  const handleSaveGame = async (gameNumbers: number[], gameId: number) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (savedGamesRemaining <= 0) {
      alert("Você atingiu o limite de jogos salvos!");
      return;
    }
    if (currentConcurso === null) {
      alert("Aguardando carregar o número do concurso...");
      return;
    }
    const signature = [...gameNumbers].sort((a, b) => a - b).join(",");
    const isDup = savedGames.some(
      (g) => [...g.numbers].sort((a, b) => a - b).join(",") === signature
    );
    if (isDup) {
      setShowDuplicateAlert(true);
      return;
    }
    setSavingGameId(gameId);
    try {
      const res = await fetch("/api/auth/saved-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          numbers: gameNumbers,
          concurso: currentConcurso,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao salvar jogo");
      }
      const newBet = await res.json();
      setSavedGames((prev) => [newBet, ...prev]);
      setSavedGamesRemaining((prev) => prev - 1);
    } catch (error: any) {
      console.error("Erro ao salvar jogo:", error);
      alert(error.message || "Erro ao salvar jogo. Tente novamente.");
    } finally {
      setSavingGameId(null);
    }
  };

  const batches = gameGen.batches;
  const activeGames = batches[activeTab] || [];
  const gamesRemaining = hasAccessToResource(subscriptionPlan, activeTab)
    ? GENERATION_LIMITS[activeTab] - activeGames.length
    : 0;

  const handleGenerateSingle = () => {
    if (
      !hasAccessToResource(subscriptionPlan, activeTab) ||
      gamesRemaining <= 0
    )
      return;
    gameGen.addGame(activeTab, activeGames, atrasados, frequencias);
  };
  const handleGenerateBatch = () => {
    if (
      !hasAccessToResource(subscriptionPlan, activeTab) ||
      gamesRemaining <= 0
    )
      return;
    gameGen.generateBatch(
      activeTab,
      gamesRemaining,
      activeGames,
      atrasados,
      frequencias
    );
  };
  const handleClearBatch = () => gameGen.clearBatch(activeTab);
  const handleSetFixedNumbers = (t: GeneratorType, nums: number[]) =>
    gameGen.setFixedNumbers(t, nums);
  const handleSetExcludedNumbers = (t: GeneratorType, nums: number[]) =>
    gameGen.setExcludedNumbers(t, nums);

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
        alert(err.error || "Limite atingido ou erro");
        setLoadingTurbo(false);
        return;
      }
      
      const data = await resp.json();
      setTurboUsages(data.usos);
      setTurboLimit(data.limite);

      if (activeTab === "premium") {
        setShowIntervalModal(true);
        setLoadingTurbo(false);
        return;
      } else {
        if (activeTab === "free") {
          await gameGen.generateBatch(activeTab, 12, activeGames, atrasados, frequencias);
        } else if (activeTab === "basic") {
          await gameGen.generateBatch(activeTab, 30, activeGames, atrasados, frequencias);
        } else if (activeTab === "plus") {
          await gameGen.generateBatch(activeTab, 30, activeGames, atrasados, frequencias);
        }
      }
    } catch (e: any) {
      alert(`Erro ao usar Turbo: ${e.message || "Erro desconhecido"}`);
    }
    setLoadingTurbo(false);
  };

  // CORREÇÃO PRINCIPAL: Adicionado o campo "modo" na requisição
  const handlePremiumAnalysis = async () => {
    setShowIntervalModal(false);
    setLoadingTurbo(true);
    
    try {
      const analysisResponse = await fetch("/api/analise-premium", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          modo: "turbo", // Campo obrigatório adicionado
          quantidadeConcursos: intervalValue 
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "Falha na análise premium");
      }

      const results = await analysisResponse.json();
      setPremiumResults(results);
      setShowPremiumResults(true);
    } catch (e: any) {
      alert(`Erro na análise premium: ${e.message || "Erro desconhecido"}`);
    } finally {
      setLoadingTurbo(false);
    }
  };

  const handleTabChange = (tab: GeneratorType) => {
    if (hasAccessToResource(subscriptionPlan, tab)) {
      setActiveTab(tab);
    } else {
      setTargetPlan(tab);
      setShowUpgradeModal(true);
    }
  };
  const handleUpgradeConfirm = () => {
    router.push("/minha-conta/assinaturas");
    setShowDuplicateAlert(false);
  };

  const showLoading = useLoadingDelay(loadingData);

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
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isLoggedIn={isLoggedIn}
        user={user}
        subscriptionPlan={subscriptionPlan}
        activeGames={activeGames}
        gamesRemaining={gamesRemaining}
        historicos={historicos}
        loading={gameGen.loading}
        loadingData={loadingData}
        batchGenerating={gameGen.batchGenerating}
        batchProgress={gameGen.batchProgress}
        error={gameGen.error}
        numberPreferences={gameGen.numberPreferences}
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
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradeConfirm}
        targetPlan={targetPlan}
      />

      <AlertModal
        isOpen={showDuplicateAlert}
        onClose={() => setShowDuplicateAlert(false)}
        title="Jogo Duplicado"
        message="Este jogo já foi salvo anteriormente e não pode ser adicionado novamente."
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
        title="Análise Premium"
        message="Quantos concursos deseja analisar?"
        inputLabel="Intervalo (3-100)"
        inputValue={intervalValue}
        onInputChange={(e) => {
          const value = parseInt(e.target.value);
          if (!isNaN(value)) {
            setIntervalValue(Math.max(3, Math.min(100, value)));
          }
        }}
      />
    </>
  );
}