/* =============================================================================
 * ARQUIVO: src/components/gerador/GeneratorPanel.tsx
 * DESCRIÇÃO: Painel principal para geração de jogos, exibe controles de geração,
 * lista de combinações, permite salvar e controlar uso do Turbo por aba/plano.
 * ============================================================================= */

import React, { useState } from 'react'
import {
  FaDice,
  FaStar,
  FaGem,
  FaCrown,
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaExclamationTriangle,
  FaBolt,
  FaCopy, // Novo ícone para cópia
} from 'react-icons/fa'
import { GeneratorType, LEVEL_DESCRIPTIONS } from '@/types/generator'
import GamesList from './GamesList'
import ProgressBar from './ProgressBar'
import { GeneratedGame } from '@/types/generator'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

interface GeneratorPanelProps {
  activeTab: GeneratorType
  activeGames: GeneratedGame[]
  gamesRemaining: number
  loading: boolean
  batchGenerating: boolean
  batchProgress: number
  errorMessage: string | null
  handleAddGame: () => void
  handleGenerateBatch: () => void
  handleClearBatch: () => void
  isLoggedIn: boolean
  onButtonHover: () => void
  savedGamesRemaining: number
  onSaveGame: (numbers: number[], gameId: number) => void
  savingGameId: number | null

  // TURBO
  subscriptionPlan: "free" | "basic" | "plus" | "premium"
  onTurbo: () => void
  turboUsages: number
  turboLimit: number
  loadingTurbo: boolean
}

export default function GeneratorPanel({
  activeTab,
  activeGames,
  gamesRemaining,
  loading,
  batchGenerating,
  batchProgress,
  errorMessage,
  handleAddGame,
  handleGenerateBatch,
  handleClearBatch,
  isLoggedIn,
  onButtonHover,
  savedGamesRemaining,
  onSaveGame,
  savingGameId,
  subscriptionPlan,
  onTurbo,
  turboUsages,
  turboLimit,
  loadingTurbo,
}: GeneratorPanelProps) {
  // Modal do Turbo
  const [showTurboModal, setShowTurboModal] = useState(false)

  // Estado para feedback visual de cópia
  const [copiedFeedback, setCopiedFeedback] = useState(false)

  // Lógica adaptativa TURBO: label, descrição, regra por aba
  let turboLabel = "Turbo"
  let turboDesc = ""
  let turboDisabled = false

  // Verificação de autenticação e limites
  if (!isLoggedIn) {
    turboDesc = "Você precisa estar logado para usar o Turbo."
    turboDisabled = true
  } else if (activeTab === 'free') {
    turboLabel = "Turbo (12 jogos)"
    turboDesc = "Você pode usar 1x ao dia para gerar um lote de 12 jogos de uma vez."
    turboDisabled = turboUsages >= turboLimit
  } else if (activeTab === 'basic') {
    turboLabel = "Turbo (30 jogos)"
    turboDesc = "Você pode usar 2x ao dia para gerar um lote de 30 jogos de uma vez."
    turboDisabled = turboUsages >= turboLimit
  } else if (activeTab === 'plus') {
    turboLabel = "Turbo Eficiência Máxima"
    turboDesc = "Permite 2 usos diários para gerar lotes com máxima eficiência baseada nos concursos da semana anterior."
    turboDisabled = turboUsages >= turboLimit
  } else if (activeTab === 'premium') {
    turboLabel = "Análise Turbo Prêmio"
    turboDesc = "Exibe qual jogo teve melhor desempenho (acertos) em um período de 3 a 30 dias anteriores."
    turboDisabled = turboUsages >= turboLimit
  }

  // Função para formatar e copiar o lote para área de transferência
  const copyBatchToClipboard = () => {
    // Formata cada jogo em 3 linhas de 5 números cada
    const batchText = activeGames
      .map((game, index) => {
        // Ordena os números e formata com dois dígitos
        const numbers = [...game.numbers].sort((a, b) => a - b)
        const lines = [
          `${index + 1}º Jogo:`,
          numbers.slice(0, 5).map(n => n.toString().padStart(2, '0')).join(' '),
          numbers.slice(5, 10).map(n => n.toString().padStart(2, '0')).join(' '),
          numbers.slice(10, 15).map(n => n.toString().padStart(2, '0')).join(' ')
        ]
        return lines.join('\n')
      })
      .join('\n\n') // Espaço entre jogos

    // Copia para área de transferência
    navigator.clipboard.writeText(batchText)
      .then(() => {
        // Feedback visual de sucesso
        setCopiedFeedback(true)
        setTimeout(() => setCopiedFeedback(false), 2000) // Remove feedback após 2 segundos
      })
      .catch(err => {
        console.error('Falha ao copiar: ', err)
        alert('Falha ao copiar para área de transferência')
      })
  }

  return (
    <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 border border-[var(--border)] mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          {/* Título e descrição da aba */}
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {activeTab === 'free'    && <><FaDice   /> Gerador Gratuito</>}
            {activeTab === 'basic'   && <><FaStar   /> Gerador Básico</>}
            {activeTab === 'plus'    && <><FaGem    /> Gerador Plus</>}
            {activeTab === 'premium' && <><FaCrown  /> Gerador Prêmio</>}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            {LEVEL_DESCRIPTIONS[activeTab]}
            {gamesRemaining > 0 ? (
              <span className="text-green-600 font-medium">
                {' '}Você pode gerar mais {gamesRemaining} jogos.
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                {' '}Limite atingido.
              </span>
            )}
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddGame}
            onMouseEnter={onButtonHover}
            disabled={
              loading ||
              (!isLoggedIn && activeTab !== 'free') ||
              gamesRemaining <= 0
            }
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              loading ||
              (!isLoggedIn && activeTab !== 'free') ||
              gamesRemaining <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            title="Adicionar jogo"
          >
            <FaPlus />
            Adicionar Jogo
          </button>

          <button
            onClick={handleGenerateBatch}
            onMouseEnter={onButtonHover}
            disabled={
              batchGenerating ||
              (!isLoggedIn && activeTab !== 'free') ||
              gamesRemaining <= 0
            }
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              batchGenerating ||
              (!isLoggedIn && activeTab !== 'free') ||
              gamesRemaining <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800 text-white'
            }`}
            title="Gerar lote de jogos"
          >
            <FaLayerGroup className={batchGenerating ? 'animate-spin' : ''} />
            Gerar Lote
          </button>

          <button
            onClick={handleClearBatch}
            onMouseEnter={onButtonHover}
            disabled={activeGames.length === 0}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition bg-red-700 hover:bg-red-800 text-white ${
              activeGames.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            title="Limpar jogos gerados"
          >
            <FaTrash />
            Limpar Lote
          </button>

          {/* Botão Copiar Lote (apenas quando há jogos) */}
          {activeGames.length > 0 && (
            <button
              onClick={copyBatchToClipboard}
              onMouseEnter={onButtonHover}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                copiedFeedback 
                  ? 'bg-green-700 hover:bg-green-800' 
                  : 'bg-indigo-700 hover:bg-indigo-800'
              } text-white`}
              title="Copiar todos os jogos para área de transferência"
            >
              <FaCopy />
              {copiedFeedback ? 'Copiado!' : 'Copiar Lote'}
            </button>
          )}

          {/* TURBO */}
          <button
            onClick={() => setShowTurboModal(true)}
            disabled={turboDisabled || loadingTurbo}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition bg-neutral-900 hover:bg-black text-white ${
              turboDisabled || loadingTurbo ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            style={{ fontWeight: 700, letterSpacing: 1 }}
            title={turboDesc}
          >
            <FaBolt className="text-yellow-400" />
            {turboLabel}
            {turboLimit > 0 && isLoggedIn && (
              <span className="ml-2 text-xs bg-white/10 rounded px-2 py-1">{turboUsages}/{turboLimit}</span>
            )}
          </button>
        </div>
      </div>

      {/* Descrição dinâmica abaixo do botão Turbo */}
      <div className="flex justify-end">
        <span className="text-xs text-gray-400 mt-2">{turboDesc}</span>
      </div>

      {/* Progresso de geração em lote */}
      {batchGenerating && <ProgressBar progress={batchProgress} />}

      {/* Erros e alertas */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-start gap-3">
          <FaExclamationTriangle className="text-xl mt-0.5 flex-shrink-0" />
          <div>
            <strong>Atenção!</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Lista de jogos gerados ou estado vazio */}
      <div className="mt-8">
        {activeGames.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-xl">
            <p className="text-[var(--muted-foreground)]">
              Nenhum jogo gerado ainda. Use os botões acima para gerar jogos.
            </p>
          </div>
        ) : (
          <GamesList
            games={activeGames}
            type={activeTab}
            onSaveGame={onSaveGame}
            savingGameId={savingGameId}
            savedGamesRemaining={savedGamesRemaining}
          />
        )}
      </div>

      {/* Modal de confirmação Turbo */}
      <ConfirmationModal
        isOpen={showTurboModal}
        onClose={() => setShowTurboModal(false)}
        onConfirm={() => { setShowTurboModal(false); onTurbo() }}
        title="Confirmar uso do Turbo?"
        message={turboDesc}
        confirmText="Usar Turbo"
        cancelText="Cancelar"
        type="info"
        loading={loadingTurbo}
      />
    </div>
  )
}