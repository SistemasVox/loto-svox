/* =============================================================================
 * ARQUIVO: src/components/gerador/GeneratorPanel.tsx
 * VERSÃO: 4.0.0 (Etapa 3 - Controle de Lote com Recalibração Animada)
 * DESCRIÇÃO: Painel de controle final com suporte a ajuste dinâmico de lote.
 * ============================================================================= */

import React, { useState, useEffect } from 'react'
import {
  FaPlus, FaTrash, FaLayerGroup, FaBolt, FaSlidersH, FaMicrochip
} from 'react-icons/fa'
import { GeneratorType, LEVEL_DESCRIPTIONS } from '@/types/generator'
import GamesList from './GamesList'
import ProgressBar from './ProgressBar'
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
    batchProgress, handleAddGame, handleGenerateBatch,
    handleClearBatch, isLoggedIn, onButtonHover, savedGamesRemaining,
    onSaveGame, savingGameId, onTurbo, turboUsages, turboLimit, loadingTurbo,
    turboDisabled,
    // NOVAS PROPS DA ETAPA 2
    batchQuantity, setBatchQuantity
  } = props;

  const [showTurboModal, setShowTurboModal] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [renderGames, setRenderGames] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  
  // ESTADO DE ANIMAÇÃO DE RECALIBRAÇÃO (ETAPA 3)
  const [isCalibrating, setIsCalibrating] = useState(false);

  const regraTurbo = TURBO_RULES[activeTab] || { label: "Turbo", desc: "Restrito." };
  const turboDescFinal = isLoggedIn 
    ? regraTurbo.desc 
    : "Protocolo restrito. Realize login para ativar o Turbo.";

  const isLimitReached = gamesRemaining <= 0;

  // EFEITO DE RECALIBRAÇÃO AO MUDAR QUANTIDADE
  useEffect(() => {
    if (batchQuantity > 0 && !batchGenerating) {
      setIsCalibrating(true);
      const timer = setTimeout(() => setIsCalibrating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [batchQuantity, batchGenerating]);

  // Gestão da Barra de Progresso original (3.5s)
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
    <div className="bg-[#0b1120]/80 backdrop-blur-xl rounded-[2.5rem] p-10 border-2 border-slate-800/50 mb-12 shadow-2xl relative overflow-hidden">
      
      {/* Overlay de Recalibração (Animação de Carga de Dados) */}
      {isCalibrating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse z-50" />
      )}

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

        <div className="flex flex-wrap items-center gap-4">
          
          {/* SELETOR DE QUANTIDADE (BATCH SELECTOR) */}
          {!isLimitReached && !batchGenerating && (
            <div className={`flex flex-col gap-2 min-w-[220px] bg-black/40 p-4 rounded-2xl border transition-all duration-300 ${isCalibrating ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-800/50'}`}>
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                  <FaSlidersH className={isCalibrating ? 'text-green-500 animate-spin-slow' : 'text-slate-600'} /> 
                  {isCalibrating ? 'RECALIBRANDO_' : 'CARGA_LOTE'}
                </span>
                <span className={`text-xs font-black italic transition-colors ${isCalibrating ? 'text-white' : 'text-green-500'}`}>
                  {batchQuantity} JOGOS
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={gamesRemaining}
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
              />
            </div>
          )}

          <button 
            onClick={handleAddGame} 
            disabled={isLimitReached || loading || batchGenerating}
            onMouseEnter={onButtonHover}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95
              ${isLimitReached || loading || batchGenerating
                ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50" 
                : "bg-[#050505] text-blue-500 border border-blue-500/30 hover:border-blue-500/60"}`}
          >
            <FaPlus /> ADICIONAR_
          </button>

          {/* BOTÃO DINÂMICO: Mostra a quantidade escolhida */}
          <button 
            onClick={handleGenerateBatch} 
            disabled={isLimitReached || loading || batchGenerating || batchQuantity <= 0}
            onMouseEnter={onButtonHover}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 relative overflow-hidden
              ${isLimitReached || loading || batchGenerating || batchQuantity <= 0
                ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50" 
                : "bg-[#050505] text-green-500 border border-green-500/30 hover:border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.1)]"}`}
          >
            {isCalibrating && (
              <span className="absolute inset-0 bg-green-500/10 animate-pulse" />
            )}
            <FaLayerGroup className={isCalibrating ? 'animate-bounce' : ''} /> 
            GERAR_{batchQuantity || 'LOTE'}
          </button>

          <button 
            onClick={() => setShowTurboModal(true)} 
            disabled={turboDisabled || loadingTurbo}
            onMouseEnter={onButtonHover}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 border-2 italic
              ${turboDisabled 
                ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-40" 
                : "bg-[#050505] text-orange-500 border-orange-500/40 hover:border-orange-500/60 shadow-[0_0_30px_rgba(249,115,22,0.15)]"}`}
          >
            <FaBolt className={!turboDisabled ? "text-orange-400" : "text-slate-700"} /> {regraTurbo.label}
          </button>

          <button 
            onClick={handleClearBatch} 
            onMouseEnter={onButtonHover}
            className="p-4 bg-[#050505] text-red-500 border border-red-500/30 rounded-2xl transition-all active:scale-95 hover:border-red-500/60"
            title="LIMPAR LOTE"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {showProgress && <ProgressBar progress={internalProgress} />}

      <div className="flex justify-between items-center border-t border-slate-800/50 pt-6 mt-6">
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${!isLoggedIn ? 'text-orange-500/70' : 'text-slate-600'}`}>
          {isCalibrating ? (
            <span className="text-green-500 flex items-center gap-2">
              <FaMicrochip className="animate-spin" /> SINCRONIZANDO_RECURSOS_ESTATÍSTICOS...
            </span>
          ) : turboDescFinal}
        </span>
        <span className="text-[9px] font-black text-green-500/80 uppercase italic animate-pulse">• VPS_LATENCY: STABLE</span>
      </div>

      <div className="mt-12">
        {renderGames && activeGames.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GamesList 
              games={activeGames} 
              type={activeTab} 
              onSaveGame={onSaveGame} 
              savingGameId={savingGameId} 
              savedGamesRemaining={savedGamesRemaining}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ) : !showProgress && (
          <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-[3rem] bg-[#050505]/30">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] italic">
              AGUARDANDO PROTOCOLO DE GERAÇÃO_
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={showTurboModal} 
        onClose={() => setShowTurboModal(false)} 
        onConfirm={() => { setShowTurboModal(false); onTurbo() }} 
        title="EXECUTAR PROTOCOLO TURBO?" 
        message={turboDescFinal} 
        confirmText="CONFIRMAR_" 
        cancelText="ABORTAR" 
        type="info" 
        loading={loadingTurbo} 
      />

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}