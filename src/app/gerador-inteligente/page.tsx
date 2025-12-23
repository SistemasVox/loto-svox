/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/page.tsx
 * VERSÃO: 6.0.0 (Implementação de Controle de Lote Dinâmico)
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
  return planHierarchy.indexOf(userPlan) >= planHierarchy.indexOf(requiredPlan);
}

const useBlobSound = (soundPath: string) => {
  const [play, setPlay] = useState<() => void>(() => () => {});
  const [userInteracted, setUserInteracted] = useState(false);

  const handleInteraction = useCallback(() => { setUserInteracted(true); }, []);

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
        setPlay(() => () => {
          if (audio && userInteracted) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Erro áudio:", e));
          }
        });
      } catch (error) { console.error("Erro áudio:", error); }
    };
    loadSound();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [soundPath, userInteracted]);
  return { play };
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
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const gameGen = useGameGenerator();

  const [activeTab, setActiveTab] = useState<GeneratorType>("free");
  const [historicos, setHistoricos] = useState<ResultadoHistorico[]>([]);
  const [frequencias, setFrequencias] = useState<any[]>([]);
  const [atrasados, setAtrasados] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "basic" | "plus" | "premium">("free");
  const [currentConcurso, setCurrentConcurso] = useState<number | null>(null);

  // NOVO ESTADO: Controle de Quantidade de Lote
  const [batchQuantity, setBatchQuantity] = useState<number>(0);

  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [savedGamesRemaining, setSavedGamesRemaining] = useState(0);
  const [savingGameId, setSavingGameId] = useState<number | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  const [turboUsages, setTurboUsages] = useState(0);
  const [turboLimit, setTurboLimit] = useState(1);
  const [loadingTurbo, setLoadingTurbo] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const [showPremiumResults, setShowPremiumResults] = useState(false);
  const [premiumResults, setPremiumResults] = useState<any>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [intervalValue, setIntervalValue] = useState(10);

  const { play: playHoverSound } = useBlobSound("/sounds/beep-1.mp3");

  useEffect(() => {
    async function init() {
      setLoadingData(true);
      try {
        const res = await fetch("/api/resultados");
        const data = await res.json();
        setHistoricos(data);
        if (data.length > 0) {
          setCurrentConcurso(data.reduce((acc: number, h: any) => h.concurso > acc ? h.concurso : acc, data[0].concurso));
        }
        setFrequencias(calculateFrequencies(data));
        setAtrasados(calculateDelayedNumbers(data));

        if (isLoggedIn) {
          const [resSub, resSaved, resTurbo] = await Promise.all([
            fetch("/api/auth/subscriptions", { credentials: "include" }),
            fetch("/api/auth/saved-games", { credentials: "include" }),
            fetch(`/api/turbo-usage?tab=${activeTab}`)
          ]);
          
          const dSub = await resSub.json();
          const raw = Array.isArray(dSub) && dSub.length > 0 ? dSub[0].plano.toLowerCase() : "free";
          setSubscriptionPlan((raw === "basico" ? "basic" : raw === "premio" ? "premium" : raw) as any);

          const dSaved = await resSaved.json();
          setSavedGames(dSaved.games || []);
          setSavedGamesRemaining(dSaved.remaining || 0);

          const dTurbo = await resTurbo.json();
          setTurboUsages(dTurbo.usos || 0);
          setTurboLimit(dTurbo.limite || 1);
        }
      } catch (err) { console.error(err); } finally { setLoadingData(false); }
    }
    init();
  }, [isLoggedIn, activeTab]);

  const activeGames = gameGen.batches[activeTab] || [];
  const hasAccess = hasAccessToResource(subscriptionPlan, activeTab);
  const gamesRemaining = hasAccess ? GENERATION_LIMITS[activeTab] - activeGames.length : 0;

  // REQUISITO: Sincronização automática do valor padrão do lote
  useEffect(() => {
    setBatchQuantity(Math.max(0, gamesRemaining));
  }, [gamesRemaining]);

  const handleSaveGame = useCallback(async (gameNumbers: number[], gameId: number) => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (savedGamesRemaining <= 0) { alert("Limite de salvamento atingido!"); return; }
    if (currentConcurso === null) return;

    const signature = [...gameNumbers].sort((a, b) => a - b).join(",");
    const isDup = savedGames.some(g => [...g.numbers].sort((a, b) => a - b).join(",") === signature);
    
    if (isDup) { setShowDuplicateAlert(true); return; }

    setSavingGameId(gameId);
    try {
      const res = await fetch("/api/auth/saved-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ numbers: gameNumbers, concurso: currentConcurso }),
      });
      if (res.ok) {
        const newBet = await res.json();
        setSavedGames(prev => [newBet, ...prev]);
        setSavedGamesRemaining(prev => prev - 1);
      }
    } catch (e) { console.error(e); } finally { setSavingGameId(null); }
  }, [isLoggedIn, savedGames, savedGamesRemaining, currentConcurso, router]);

  const handleGenerateSingle = () => {
    if (!hasAccess || gamesRemaining <= 0) return;
    gameGen.addGame(activeTab, activeGames, atrasados, frequencias);
  };

  // REQUISITO: Geração com quantidade definida pelo usuário
  const handleGenerateBatch = () => {
    if (!hasAccess || gamesRemaining <= 0 || batchQuantity <= 0) return;
    gameGen.generateBatch(activeTab, batchQuantity, activeGames, atrasados, frequencias);
  };

  const handleTurbo = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    setLoadingTurbo(true);
    try {
      const resp = await fetch("/api/turbo-usage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        alert(err.error || "Limite atingido");
        return;
      }
      const data = await resp.json();
      setTurboUsages(data.usos);
      if (activeTab === "premium") setShowIntervalModal(true);
      else {
        const qty = activeTab === "free" ? 12 : 30;
        await gameGen.generateBatch(activeTab, qty, activeGames, atrasados, frequencias);
      }
    } finally { setLoadingTurbo(false); }
  };

  const handlePremiumAnalysis = async () => {
    setShowIntervalModal(false);
    setLoadingTurbo(true);
    try {
      const res = await fetch("/api/analise-premium", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modo: "turbo", quantidadeConcursos: intervalValue }),
      });
      const results = await res.json();
      setPremiumResults(results);
      setShowPremiumResults(true);
    } finally { setLoadingTurbo(false); }
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
        {...gameGen}
        activeTab={activeTab}
        setActiveTab={(t: GeneratorType) => {
          if (t === 'free' || (isLoggedIn && hasAccessToResource(subscriptionPlan, t))) setActiveTab(t);
          else { setTargetPlan(t); setShowUpgradeModal(true); }
        }}
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
        handleClearBatch={() => gameGen.clearBatch(activeTab)}
        handleSetFixedNumbers={gameGen.setFixedNumbers}
        handleSetExcludedNumbers={gameGen.setExcludedNumbers}
        savedGamesRemaining={savedGamesRemaining}
        onSaveGame={handleSaveGame}
        savingGameId={savingGameId}
        onTurbo={handleTurbo}
        turboUsages={turboUsages}
        turboLimit={turboLimit}
        loadingTurbo={loadingTurbo}
        // NOVAS PROPS PARA FLEXIBILIDADE DE LOTE
        batchQuantity={batchQuantity}
        setBatchQuantity={setBatchQuantity}
      />

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} onUpgrade={() => router.push("/minha-conta/assinaturas")} targetPlan={targetPlan} />
      
      <AlertModal
        isOpen={showDuplicateAlert}
        onClose={() => setShowDuplicateAlert(false)}
        title="Jogo Duplicado"
        message="Este jogo já foi salvo anteriormente e não pode ser adicionado novamente."
        buttonText="Entendi"
        redirectPath="/meus-jogos"
      />

      <TurboResultadosModal isOpen={showPremiumResults} onClose={() => setShowPremiumResults(false)} resultados={premiumResults} />
      
      <InputModal
        isOpen={showIntervalModal}
        onClose={() => setShowIntervalModal(false)}
        onConfirm={handlePremiumAnalysis}
        title="Análise Premium"
        message="Quantos concursos deseja analisar?"
        inputLabel="Intervalo (3-100)"
        inputValue={intervalValue}
        onInputChange={(e: any) => setIntervalValue(Math.max(3, Math.min(100, parseInt(e.target.value) || 3)))}
      />
    </>
  );
}