/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/GeradorInteligenteView.tsx
 * VERSÃO: 2.3.5 (Full Implementation - No Omissions)
 * DESCRIÇÃO: View principal do Gerador Inteligente. Gerencia a composição da 
 * UI e o feedback visual contextual (Toast Colorido).
 * ============================================================================= */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratorType } from '@/types/generator';
import { gameStyles } from '@/styles/gameStyles';

// Componentes internos de negócio
import GeneratorTabs from '@/components/gerador/GeneratorTabs';
import GeneratorPanel from '@/components/gerador/GeneratorPanel';
import BatchAnalysis from '@/components/gerador/BatchAnalysis';
import LevelComparison from '@/components/gerador/LevelComparison';
import NumberSelectionTables from '@/components/gerador/NumberSelectionTables';
import UpgradeModal from '@/components/ui/UpgradeModal';
import RestrictedAccessView from '@/components/gerador/RestrictedAccessView';
import GeradorHeader from '@/components/gerador/GeradorHeader';

// Hooks utilitários
import { useSpecialBrowserDetection } from '@/hooks/useSpecialBrowserDetection';

// =============================================================================
// INTERFACES TÉCNICAS
// =============================================================================
interface GeradorInteligenteViewProps {
  activeTab: GeneratorType;
  setActiveTab: (tab: GeneratorType) => void;
  isLoggedIn: boolean;
  user: any;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  activeGames: any[];
  gamesRemaining: number;
  historicos: any[];
  loading: boolean;
  loadingData: boolean;
  batchGenerating: boolean;
  batchProgress: number;
  error: string | null;
  numberPreferences: any;
  handleGenerateSingle: () => void;
  handleGenerateBatch: () => void;
  handleClearBatch: () => void; // Obrigatório para evitar ReferenceError
  handleSetFixedNumbers: (type: GeneratorType, numbers: number[]) => void;
  handleSetExcludedNumbers: (type: GeneratorType, numbers: number[]) => void;
  playHoverSound: () => void;
  savedGamesRemaining: number;
  onSaveGame: (gameNumbers: number[], gameId: number) => void;
  savingGameId: number | null;
  onTurbo: () => void;
  turboUsages: number;
  turboLimit: number;
  loadingTurbo: boolean;
  // Propriedade de Feedback Visual
  toast?: { message: string; target: 'fixed' | 'excluded' } | null;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function GeradorInteligenteView(props: GeradorInteligenteViewProps) {
  // Destruturação total das props para disponibilidade imediata no JSX
  const {
    activeTab,
    setActiveTab,
    isLoggedIn,
    user,
    subscriptionPlan,
    activeGames,
    gamesRemaining,
    historicos,
    loading,
    loadingData,
    batchGenerating,
    batchProgress,
    error,
    numberPreferences,
    handleGenerateSingle,
    handleGenerateBatch,
    handleClearBatch,
    handleSetFixedNumbers,
    handleSetExcludedNumbers,
    playHoverSound,
    savedGamesRemaining,
    onSaveGame,
    savingGameId,
    onTurbo,
    turboUsages,
    turboLimit,
    loadingTurbo,
    toast
  } = props;

  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const isSpecialBrowser = useSpecialBrowserDetection();

  // Guarda de Acesso: Bloqueio para abas avançadas sem autenticação
  if (!isLoggedIn && (activeTab === 'plus' || activeTab === 'premium')) {
    return <RestrictedAccessView activeTab={activeTab} playHoverSound={playHoverSound} />;
  }

  // Handlers internos de UI
  const handleLockedTabClick = (tab: GeneratorType) => {
    setTargetPlan(tab);
    setShowUpgradeModal(true);
  };

  const handleUpgradeClick = (plan: string) => {
    setTargetPlan(plan as GeneratorType);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    router.push('/minha-conta/assinaturas');
    setShowUpgradeModal(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 relative bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Cabeçalho de Status do Usuário */}
        <GeradorHeader
          isSpecialBrowser={isSpecialBrowser}
          user={user}
          subscriptionPlan={subscriptionPlan}
          historicos={historicos}
          savedGamesRemaining={savedGamesRemaining}
        />

        <div className="space-y-8">
          
          {/* Navegação entre Algoritmos */}
          <div className="animate-slide-in-delayed-1">
            <GeneratorTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              batches={{ [activeTab]: activeGames }}
              isLoggedIn={isLoggedIn}
              subscriptionPlan={subscriptionPlan}
              onTabHover={playHoverSound}
              onLockedTabClick={handleLockedTabClick}
            />
          </div>

          {/* Configuração de Dezenas (Somente Plus/Premium) */}
          {(activeTab === 'plus' || activeTab === 'premium') && (
            <div className="animate-slide-in-delayed-2 relative">
              
              {/* FEEDBACK TOAST CONTEXTUAL */}
              {toast && (
                <div 
                  className={`absolute z-[50] pointer-events-none transition-all duration-300 animate-toast-pop
                    ${toast.target === 'fixed' ? 'left-4 sm:left-[15%]' : 'right-4 sm:right-[15%]'}
                    top-[-35px]`}
                >
                  <div className={`px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border-2 backdrop-blur-md ${
                    toast.target === 'fixed' 
                      ? 'bg-green-600/90 text-white border-green-400' 
                      : 'bg-red-600/90 text-white border-red-400'
                  }`}>
                    <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                      <span className="text-xs">{toast.target === 'fixed' ? '✓' : '✕'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[10px] uppercase tracking-widest leading-none mb-0.5">
                        {toast.target === 'fixed' ? 'Ajuste em Fixos' : 'Ajuste em Excluídos'}
                      </span>
                      <span className="text-sm font-bold leading-none">{toast.message}</span>
                    </div>
                  </div>
                </div>
              )}

              <NumberSelectionTables
                activeTab={activeTab}
                numerosFixos={numberPreferences[activeTab].fixos}
                numerosExcluidos={numberPreferences[activeTab].excluidos}
                onFixedNumbersChange={nums => handleSetFixedNumbers(activeTab, nums)}
                onExcludedNumbersChange={nums => handleSetExcludedNumbers(activeTab, nums)}
                onHover={playHoverSound}
              />
            </div>
          )}

          {/* Painel Central de Geração */}
          <div className={`animate-slide-in-delayed-${(activeTab === 'plus' || activeTab === 'premium') ? '3' : '2'}`}>
            <GeneratorPanel
              activeTab={activeTab}
              activeGames={activeGames}
              gamesRemaining={gamesRemaining}
              loading={loading || loadingData}
              batchGenerating={batchGenerating}
              batchProgress={batchProgress}
              errorMessage={error}
              handleAddGame={handleGenerateSingle}
              handleGenerateBatch={handleGenerateBatch}
              handleClearBatch={handleClearBatch}
              isLoggedIn={isLoggedIn}
              onButtonHover={playHoverSound}
              savedGamesRemaining={savedGamesRemaining}
              onSaveGame={onSaveGame}
              savingGameId={savingGameId}
              subscriptionPlan={subscriptionPlan}
              onTurbo={onTurbo}
              turboUsages={turboUsages}
              turboLimit={turboLimit}
              loadingTurbo={loadingTurbo}
            />
          </div>

          {/* Resultados e Análise de Lote */}
          {activeGames.length > 0 && (
            <div className={`animate-slide-in-delayed-${(activeTab === 'plus' || activeTab === 'premium') ? '4' : '3'}`}>
              <BatchAnalysis games={activeGames} />
            </div>
          )}

          {/* Tabela de Planos e Upgrades */}
          <div className={`animate-slide-in-delayed-${(activeTab === 'plus' || activeTab === 'premium') ? '5' : '4'}`}>
            <LevelComparison
              isLoggedIn={isLoggedIn}
              subscriptionPlan={subscriptionPlan}
              onPlanHover={playHoverSound}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>
        </div>
      </div>

      {/* Modal de Upgrade Global */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeConfirm}
          targetPlan={targetPlan}
        />
      )}

      {/* ESTILOS CSS-IN-JS (Scoped) */}
      <style jsx global>{`
        /* Animação de Entrada dos Painéis */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Animação do Toast Pop (Feedback Imediato) */
        @keyframes toastPop {
          0% { opacity: 0; transform: translateY(20px) scale(0.85); }
          40% { opacity: 1; transform: translateY(-8px) scale(1.08); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-slide-in-delayed-1 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both; }
        .animate-slide-in-delayed-2 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both; }
        .animate-slide-in-delayed-3 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both; }
        .animate-slide-in-delayed-4 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both; }
        .animate-slide-in-delayed-5 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both; }
        
        .animate-toast-pop { animation: toastPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        .dezena-bola { ${gameStyles.dezenaBola} }

        /* Custom Scrollbar para experiência Webmaster */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #404040, #0ea5e9); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
      `}</style>
    </div>
  );
}