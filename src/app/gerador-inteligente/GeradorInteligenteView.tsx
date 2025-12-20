// =============================================================================
// ARQUIVO: src/app/gerador-inteligente/GeradorInteligenteView.tsx
// DESCRIÇÃO: View principal do Gerador Inteligente. Atua como um orquestrador,
//            gerenciando o estado e compondo a UI a partir de componentes
//            especializados.
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratorType } from '@/types/generator';
import { gameStyles } from '@/styles/gameStyles';

// Componentes importados
import GeneratorTabs from '@/components/gerador/GeneratorTabs';
import GeneratorPanel from '@/components/gerador/GeneratorPanel';
import BatchAnalysis from '@/components/gerador/BatchAnalysis';
import LevelComparison from '@/components/gerador/LevelComparison';
import NumberSelectionTables from '@/components/gerador/NumberSelectionTables';
import UpgradeModal from '@/components/ui/UpgradeModal';
import RestrictedAccessView from '@/components/gerador/RestrictedAccessView';
import GeradorHeader from '@/components/gerador/GeradorHeader';

// Hook e utilitários importados
import { useSpecialBrowserDetection } from '@/hooks/useSpecialBrowserDetection';

// =============================================================================
// INTERFACES
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
}

// =============================================================================
// COMPONENTE DE APRESENTAÇÃO
// =============================================================================
export default function GeradorInteligenteView(props: GeradorInteligenteViewProps) {
  const {
    activeTab, setActiveTab, isLoggedIn, user, subscriptionPlan, activeGames,
    gamesRemaining, historicos, loading, loadingData, batchGenerating,
    batchProgress, error, numberPreferences, handleGenerateSingle,
    handleGenerateBatch, handleClearBatch, handleSetFixedNumbers,
    handleSetExcludedNumbers, playHoverSound, savedGamesRemaining,
    onSaveGame, savingGameId, onTurbo, turboUsages, turboLimit, loadingTurbo
  } = props;

  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<GeneratorType | null>(null);
  const isSpecialBrowser = useSpecialBrowserDetection();

  if (!isLoggedIn && (activeTab === 'plus' || activeTab === 'premium')) {
    return <RestrictedAccessView activeTab={activeTab} playHoverSound={playHoverSound} />;
  }

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
        <GeradorHeader
          isSpecialBrowser={isSpecialBrowser}
          user={user}
          subscriptionPlan={subscriptionPlan}
          historicos={historicos}
          savedGamesRemaining={savedGamesRemaining}
        />

        <div className="space-y-8">
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
          {(activeTab === 'plus' || activeTab === 'premium') && (
            <div className="animate-slide-in-delayed-2">
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
          {activeGames.length > 0 && (
            <div className={`animate-slide-in-delayed-${(activeTab === 'plus' || activeTab === 'premium') ? '4' : '3'}`}>
              <BatchAnalysis games={activeGames} />
            </div>
          )}
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

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeConfirm}
          targetPlan={targetPlan}
        />
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-slide-in-delayed-1 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both; }
        .animate-slide-in-delayed-2 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both; }
        .animate-slide-in-delayed-3 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both; }
        .animate-slide-in-delayed-4 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both; }
        .animate-slide-in-delayed-5 { animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both; }
        
        .dezena-bola { ${gameStyles.dezenaBola} }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #404040, #0ea5e9); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
      `}</style>
    </div>
  );
}