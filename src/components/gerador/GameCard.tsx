/* =============================================================================
 * ARQUIVO: src/components/gerador/GameCard.tsx
 * DESCRIÇÃO: Card para exibir combinação gerada e permitir salvar como aposta (Bet)
 * ============================================================================= */

import React from 'react'
import { GeneratedGame, GeneratorType } from '@/types/generator'
import { FaDice, FaStar, FaGem, FaCrown, FaBookmark, FaSpinner } from 'react-icons/fa'

/* =============================================================================
 * INTERFACE: GameCardProps
 * Props do componente GameCard
 * ============================================================================= */
interface GameCardProps {
  game: GeneratedGame               // combinação gerada
  type: GeneratorType               // tipo de gerador (free, basic, plus, premium)
  index: number                     // índice do jogo na lista (usado como gameId)
  onSaveGame: (numbers: number[], gameId: number) => void  // callback para salvar aposta
  saving: boolean                   // estado de salvamento em andamento
  savedGamesRemaining: number       // quantos salvos ainda pode fazer
}

/* =============================================================================
 * COMPONENTE: GameCard
 * Exibe os números da combinação e botão para salvar (Bet)
 * ============================================================================= */
export default function GameCard({
  game,
  type,
  index,
  onSaveGame,
  saving,
  savedGamesRemaining,
}: GameCardProps) {
  // =============================================================================
  // HANDLER: ao clicar em salvar
  // =============================================================================
  const handleSave = () => {
    if (savedGamesRemaining <= 0) {
      alert("Você atingiu o limite de jogos salvos!")
      return
    }
    if (saving) return
    onSaveGame(game.numbers, index)
  }

  // =============================================================================
  // RENDERIZAÇÃO
  // =============================================================================
  return (
    <div className="p-4 rounded-lg shadow-md border border-[var(--border)] bg-[var(--card)] animate-fade-in relative">
      {/* ----------------------------------------------------
       * Cabeçalho: tipo e número do jogo
       * ---------------------------------------------------- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium flex items-center gap-1">
            {type === 'free'    && <><FaDice    /> Gratuito</>}
            {type === 'basic'   && <><FaStar    /> Básico</>}
            {type === 'plus'    && <><FaGem     /> Plus</>}
            {type === 'premium' && <><FaCrown   /> Prêmio</>}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Jogo #{index + 1}
          </div>
        </div>

        {/* ----------------------------------------------------
         * Botão Salvar aposta
         * ---------------------------------------------------- */}
        <button
          onClick={handleSave}
          disabled={saving || savedGamesRemaining <= 0}
          title={
            saving
              ? "Salvando..."
              : savedGamesRemaining <= 0
                ? "Limite de salvos atingido"
                : "Salvar este jogo"
          }
          className={`p-2 rounded-md transition ${
            saving
              ? 'bg-gray-200 cursor-not-allowed'
              : savedGamesRemaining <= 0
                ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
          }`}
        >
          {saving
            ? <FaSpinner className="animate-spin" />
            : <FaBookmark />
          }
        </button>
      </div>

      {/* ----------------------------------------------------
       * Números da combinação
       * ---------------------------------------------------- */}
      <div className="grid grid-cols-5 gap-2">
        {game.numbers.map((num, idx) => (
          <div
            key={idx}
            className="dezena-bola flex items-center justify-center"
          >
            {num.toString().padStart(2, '0')}
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------
       * Indicador de limite atingido
       * ---------------------------------------------------- */}
      {savedGamesRemaining <= 0 && (
        <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
          Limite: {savedGamesRemaining}
        </div>
      )}
    </div>
  )
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
