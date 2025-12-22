/* =============================================================================
 * ARQUIVO: src/components/gerador/GamesList.tsx
 * VERSÃO: 2.2.0 (Etapa 3.2 - Versão Integral de Produção)
 * DESCRIÇÃO: Lista de GameCards para exibir combinações geradas e permitir salvar.
 * ATUALIZAÇÃO: Injeção de estado de login para controle de permissões nos cards.
 * ============================================================================= */

import React from 'react'
import GameCard from './GameCard'
import { GeneratedGame, GeneratorType } from '@/types/generator'

/* =============================================================================
 * INTERFACE: GamesListProps
 * Definição rigorosa das propriedades necessárias para a listagem.
 * ============================================================================= */
interface GamesListProps {
  games: GeneratedGame[]                              // Coleção de combinações geradas
  type: GeneratorType                                  // Algoritmo ativo (free, basic, plus, premium)
  onSaveGame: (numbers: number[], gameId: number) => void // Handler de persistência definido no page.tsx
  savingGameId: number | null                          // ID do jogo em processo de escrita no banco
  savedGamesRemaining: number                          // Quota disponível para o utilizador
  isLoggedIn: boolean                                  // Flag de controlo de sessão
}

/* =============================================================================
 * COMPONENTE: GamesList
 * Renderiza um grid responsivo de GameCards injetando o contexto de autenticação.
 * ============================================================================= */
export default function GamesList({
  games,
  type,
  onSaveGame,
  savingGameId,
  savedGamesRemaining,
  isLoggedIn,
}: GamesListProps) {
  
  // Early return para evitar renderização desnecessária caso a lista esteja vazia
  if (!games || games.length === 0) return null;

  return (
    /* Mantemos rigorosamente o grid original de 2 colunas para desktop */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {games.map((game, index) => (
        <GameCard
          key={`game-card-${index}`} // Chave baseada em índice para estabilidade da lista gerada
          game={game}
          type={type}
          index={index}
          onSaveGame={onSaveGame}
          saving={savingGameId === index}
          savedGamesRemaining={savedGamesRemaining}
          isLoggedIn={isLoggedIn} // REQUISITO: Repasse da flag para o redirecionamento
        />
      ))}
    </div>
  )
}

/* =============================================================================
 * DOCUMENTAÇÃO DE IMPLEMENTAÇÃO:
 * 1. O componente recebe 'isLoggedIn' do GeneratorPanel.
 * 2. Cada GameCard agora possui autonomia para decidir se exibe o botão "Salvar" 
 * ou o botão "Entrar" (redirecionamento).
 * 3. O índice mapeado garante que o spinner de 'saving' apareça no card correto.
 * ============================================================================= */