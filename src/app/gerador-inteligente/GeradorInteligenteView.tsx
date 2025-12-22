/* =============================================================================
 * ARQUIVO: src/app/gerador-inteligente/GeradorInteligenteView.tsx
 * VERSÃO: 3.7.0 (Etapa 2 - Visualização Híbrida e Íntegra)
 * DESCRIÇÃO: View principal com suporte a análise de lote e progresso animado.
 * Ajustado para correta sinalização de login vs upgrade.
 * ============================================================================= */

import React, { useState, useMemo } from 'react';
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
  loading?: boolean;
  loadingData: boolean;
  batchGenerating: boolean;
  batchProgress: number;
  error?: string | null;
  numberPreferences: any;
  handleGenerateSingle: () => void;
  handleGenerateBatch: () => void;
  handleClearBatch: () => void;
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
  toast?: { message: string; target: 'fixed' | 'excluded' } | null;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function GeradorInteligenteView(props: GeradorInteligenteViewProps) {
  const {
    activeTab,
    setActiveTab,
    isLoggedIn,
    user,
    subscriptionPlan,
    activeGames,
    gamesRemaining,
    historicos,
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

  // Guarda de Acesso Original: Bloqueio visual para abas avançadas
  if (!isLoggedIn && (activeTab === 'plus' || activeTab === 'premium')) {
    return <RestrictedAccessView activeTab={activeTab} playHoverSound={playHoverSound} />;
  }

  /* -----------------------------------------------------------------------------
   * FIX: Extração memorizada com verificação de nulidade para evitar TypeErrors
   * ----------------------------------------------------------------------------- */
  const currentPrefs = useMemo(() => {
    return (numberPreferences && numberPreferences[activeTab]) || { fixos: [], excluidos: [] };
  }, [numberPreferences, activeTab]);

  /**
   * REQUISITO: Diferenciação entre Login e Upgrade no clique das abas
   */
  const handleLockedTabClick = (tab: GeneratorType) => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/gerador-inteligente');
      return;
    }
    setTargetPlan(tab);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    router.push('/minha-conta/assinaturas');
    setShowUpgradeModal(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 relative bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* REQUISITO: Header oculta contagem se deslogado enviando null */}
        <GeradorHeader
          isSpecialBrowser={isSpecialBrowser}
          user={user}
          subscriptionPlan={subscriptionPlan}
          historicos={historicos}
          savedGamesRemaining={isLoggedIn ? savedGamesRemaining : null}
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

          {/* Configuração de Dezenas (Plus e Premium) - Apenas se Logado */}
          {isLoggedIn && (activeTab === 'plus' || activeTab === 'premium') && (
            <div className="animate-slide-in-delayed-2 relative">
              
              {/* FEEDBACK TOAST INTEGRAL */}
              {toast && (
                <div 
                  className={`absolute z-[50] pointer-events-none transition-all duration-300 animate-toast-pop
                    ${toast.target === 'fixed' ? 'left-4 sm:left-[15%]' : 'right-4 sm:right-[15%]'}
                    top-[-40px]`}
                >
                  <div className={`px-5 py-2.5 rounded-2xl border-2 backdrop-blur-md ${
                    toast.target === 'fixed' 
                      ? 'bg-green-600/90 border-green-400' 
                      : 'bg-red-600/90 border-red-400'
                  } text-white shadow-2xl flex items-center gap-2 animate-pulse`}>
                    <span className="text-xs font-bold uppercase italic">{toast.message}</span>
                  </div>
                </div>
              )}

              <NumberSelectionTables
                activeTab={activeTab}
                numerosFixos={currentPrefs.fixos || []}
                numerosExcluidos={currentPrefs.excluidos || []}
                onFixedNumbersChange={nums => handleSetFixedNumbers(activeTab, nums)}
                onExcludedNumbersChange={nums => handleSetExcludedNumbers(activeTab, nums)}
                onHover={playHoverSound}
              />
            </div>
          )}

          {/* Painel Central de Geração (Acesso Híbrido) */}
          <div className={`animate-slide-in-delayed-${(activeTab === 'plus' || activeTab === 'premium') ? '3' : '2'}`}>
            <GeneratorPanel
              activeTab={activeTab}
              activeGames={activeGames}
              gamesRemaining={gamesRemaining}
              loading={props.loading || loadingData}
              batchGenerating={batchGenerating}
              batchProgress={batchProgress}
              errorMessage={error}
              handleAddGame={handleGenerateSingle}
              handleGenerateBatch={handleGenerateBatch}
              handleClearBatch={handleClearBatch}
              isLoggedIn={isLoggedIn}
              onButtonHover={playHoverSound}
              savedGamesRemaining={isLoggedIn ? savedGamesRemaining : 0}
              onSaveGame={onSaveGame}
              savingGameId={savingGameId}
              subscriptionPlan={subscriptionPlan}
              onTurbo={onTurbo}
              turboUsages={turboUsages}
              turboLimit={turboLimit}
              loadingTurbo={loadingTurbo}
              turboDisabled={!isLoggedIn} // Flag de conversão para o painel
            />
          </div>

          {/* Análise de Lote e Comparação */}
          {activeGames.length > 0 && (
            <div className={`animate-slide-in-delayed-4`}>
              <BatchAnalysis games={activeGames} />
            </div>
          )}

          <div className={`animate-slide-in-delayed-5`}>
            <LevelComparison
              isLoggedIn={isLoggedIn}
              subscriptionPlan={subscriptionPlan}
              onPlanHover={playHoverSound}
              onUpgradeClick={(p) => handleLockedTabClick(p as GeneratorType)}
            />
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeConfirm}
          targetPlan={targetPlan}
        />
      )}

      {/* ESTILOS CSS-IN-JS ORIGINAIS PRESERVADOS */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes toastPop {
          0% { opacity: 0; transform: translateY(20px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-slide-in-delayed-1 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both; }
        .animate-slide-in-delayed-2 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both; }
        .animate-slide-in-delayed-3 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both; }
        .animate-slide-in-delayed-4 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both; }
        .animate-slide-in-delayed-5 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both; }
        
        .animate-toast-pop { animation: toastPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        .dezena-bola { ${gameStyles.dezenaBola} }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #404040, #0ea5e9); border-radius: 3px; }
      `}</style>
    </div>
  );
}