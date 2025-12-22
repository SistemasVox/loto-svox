/* =============================================================================
 * ARQUIVO: src/components/gerador/GeneratorPanel.tsx
 * VERSÃO: 2.5.0 (Usability & Limit Logic Fix)
 * DESCRIÇÃO: Orquestrador técnico com travas de limite e design Vivid Black.
 * ============================================================================= */

import React, { useState, useEffect } from 'react'
import {
  FaDice, FaStar, FaGem, FaCrown, FaPlus, FaTrash,
  FaLayerGroup, FaExclamationTriangle, FaBolt, FaCopy,
} from 'react-icons/fa'
import { GeneratorType, LEVEL_DESCRIPTIONS } from '@/types/generator'
import GamesList from './GamesList'
import ProgressBar from './ProgressBar'
import { GeneratedGame } from '@/types/generator'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

const TURBO_RULES: Record<string, { label: string; desc: string }> = {
  free: { label: "Turbo (12 Jogos)", desc: "Carga rápida diária para 12 combinações." },
  basic: { label: "Turbo (30 Jogos)", desc: "Carga estendida para 30 combinações." },
  plus: { label: "Turbo Eficiência", desc: "Geração otimizada baseada em tendências." },
  premium: { label: "Análise Turbo", desc: "Performance histórica comparativa (3-30 dias)." }
};

export default function GeneratorPanel(props: any) {
  const {
    activeTab, activeGames, gamesRemaining, loading, batchGenerating,
    batchProgress, errorMessage, handleAddGame, handleGenerateBatch,
    handleClearBatch, isLoggedIn, onButtonHover, savedGamesRemaining,
    onSaveGame, savingGameId, onTurbo, turboUsages, turboLimit, loadingTurbo
  } = props;

  const [showTurboModal, setShowTurboModal] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  
  // ESTADOS DE SINCRONIZAÇÃO
  const [showProgress, setShowProgress] = useState(false);
  const [renderGames, setRenderGames] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);

  const regraTurbo = TURBO_RULES[activeTab] || { label: "Turbo", desc: "Restrito." };
  const turboDescFinal = isLoggedIn ? regraTurbo.desc : "Acesso restrito: Realize login.";

  // Trava de Usabilidade: Verifica se o limite foi atingido
  const isLimitReached = gamesRemaining <= 0;

  // Orquestração: Mantém a barra visível por 3.5 segundos
  useEffect(() => {
    if (batchGenerating) {
      setShowProgress(true);
      setRenderGames(false);
      setInternalProgress(0);
      const startTimer = setTimeout(() => setInternalProgress(100), 100);
      return () => clearTimeout(startTimer);
    } else if (showProgress) {
      const timer = setTimeout(() => {
        setShowProgress(false);
        setRenderGames(true);
      }, 3500); 
      return () => clearTimeout(timer);
    }
  }, [batchGenerating, showProgress]);

  useEffect(() => {
    if (activeGames.length > 0 && !batchGenerating && !showProgress) {
      setRenderGames(true);
    }
  }, [activeGames.length, batchGenerating, showProgress]);

  return (
    <div className="bg-[#0b1120]/80 backdrop-blur-xl rounded-[2.5rem] p-10 border-2 border-slate-800/50 mb-12 shadow-2xl">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-4 text-white uppercase italic tracking-wider">
             GERADOR {activeTab.toUpperCase()}
          </h2>
          <p className="text-[11px] font-bold text-slate-500 mt-3 uppercase tracking-widest leading-relaxed">
            {LEVEL_DESCRIPTIONS[activeTab]} 
            <span className={!isLimitReached ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
               CAPACIDADE: {isLimitReached ? "LIMITE ATINGIDO" : `${gamesRemaining} JOGOS DISPONÍVEIS`}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* BOTÃO ADICIONAR: Bloqueado se limite atingido ou gerando */}
          <button 
            onClick={handleAddGame} 
            disabled={isLimitReached || loading || batchGenerating}
            onMouseEnter={onButtonHover}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.05)]
              ${isLimitReached || loading || batchGenerating
                ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50" 
                : "bg-[#050505] text-blue-500 border border-blue-500/30 hover:border-blue-500/60"}`}
          >
            <FaPlus /> ADICIONAR_
          </button>

          {/* BOTÃO GERAR LOTE: Bloqueado se limite atingido ou gerando */}
          <button 
            onClick={handleGenerateBatch} 
            disabled={isLimitReached || loading || batchGenerating}
            onMouseEnter={onButtonHover}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.05)]
              ${isLimitReached || loading || batchGenerating
                ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50" 
                : "bg-[#050505] text-green-500 border border-green-500/30 hover:border-green-500/60"}`}
          >
            <FaLayerGroup /> GERAR_LOTE
          </button>

          <button 
            onClick={() => setShowTurboModal(true)} 
            disabled={loadingTurbo}
            onMouseEnter={onButtonHover}
            className="flex items-center gap-3 px-8 py-4 bg-[#050505] text-orange-500 border-2 border-orange-500/40 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.15)] italic"
          >
            <FaBolt className="text-orange-400" /> {regraTurbo.label}
            <span className="ml-2 text-[9px] bg-orange-500/20 px-2 py-0.5 rounded-lg">{turboUsages}/{turboLimit}</span>
          </button>

          <button 
            onClick={handleClearBatch} 
            onMouseEnter={onButtonHover}
            className="flex items-center gap-3 px-6 py-4 bg-[#050505] text-red-500 border border-red-500/30 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 hover:border-red-500/60"
          >
            <FaTrash /> LIMPAR_LOTE
          </button>
        </div>
      </div>

      {/* PROGRESSO TÉCNICO SINCRONIZADO */}
      {showProgress && <ProgressBar progress={internalProgress} />}

      <div className="flex justify-between items-center border-t border-slate-800/50 pt-6 mt-6">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{turboDescFinal}</span>
        <span className="text-[9px] font-black text-green-500/80 uppercase italic animate-pulse">• VPS_LATENCY: STABLE</span>
      </div>

      <div className="mt-12">
        {renderGames && activeGames.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GamesList games={activeGames} type={activeTab} onSaveGame={onSaveGame} savingGameId={savingGameId} savedGamesRemaining={savedGamesRemaining} />
          </div>
        ) : !showProgress && <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-[3rem] bg-[#050505]/30"><p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] italic">AGUARDANDO PROTOCOLO DE GERAÇÃO_</p></div>}
      </div>

      <ConfirmationModal isOpen={showTurboModal} onClose={() => setShowTurboModal(false)} onConfirm={() => { setShowTurboModal(false); onTurbo() }} title="EXECUTAR PROTOCOLO TURBO?" message={turboDescFinal} confirmText="CONFIRMAR_" cancelText="ABORTAR" type="info" loading={loadingTurbo} />
    </div>
  )
}