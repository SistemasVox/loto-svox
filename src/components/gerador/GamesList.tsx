/* =============================================================================
 * ARQUIVO: src/components/gerador/GamesList.tsx
 * DESCRIÇÃO: Lista de GameCards para exibir combinações geradas e permitir salvar
 * ============================================================================= */

import React from 'react'
import GameCard from './GameCard'
import { GeneratedGame, GeneratorType } from '@/types/generator'

/* =============================================================================
 * INTERFACE: GamesListProps
 * Props do componente GamesList
 * ============================================================================= */
interface GamesListProps {
  games: GeneratedGame[]                              // combinações geradas
  type: GeneratorType                                  // tipo de gerador
  onSaveGame: (numbers: number[], gameId: number) => void // callback salvar aposta
  savingGameId: number | null                          // índice do jogo sendo salvo
  savedGamesRemaining: number                          // salvos restantes
}

/* =============================================================================
 * COMPONENTE: GamesList
 * Renderiza um grid de GameCard
 * ============================================================================= */
export default function GamesList({
  games,
  type,
  onSaveGame,
  savingGameId,
  savedGamesRemaining,
}: GamesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {games.map((game, index) => (
        <GameCard
          key={index}
          game={game}
          type={type}
          index={index}
          onSaveGame={onSaveGame}
          saving={savingGameId === index}
          savedGamesRemaining={savedGamesRemaining}
        />
      ))}
    </div>
  )
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
