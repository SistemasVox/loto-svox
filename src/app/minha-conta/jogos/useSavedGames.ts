/* =============================================================================
 * ARQUIVO: src/app/minha-conta/jogos/useSavedGames.ts
 * DESCRIÇÃO: Hook para gerenciar apostas salvas (modelo Bet): buscar e excluir
 * ============================================================================= */

'use client'

/* =============================================================================
 * IMPORTS
 * ============================================================================= */
import { useState, useEffect } from 'react'

/* =============================================================================
 * TIPOS E INTERFACES
 * ============================================================================= */
interface SavedGame {
  id: number               // identificador da aposta
  numbers: number[]        // números apostados
  createdAt: string        // data de criação da aposta
}

interface UseSavedGamesResult {
  games: SavedGame[]                       // lista de apostas salvas
  loading: boolean                         // estado de carregamento
  error: string | null                     // mensagem de erro (se houver)
  deleteGame: (id: number) => Promise<void>// função para excluir aposta
}

/* =============================================================================
 * HOOK PRINCIPAL: useSavedGames
 * ============================================================================= */
export function useSavedGames(): UseSavedGamesResult {
  /* ========================================================================
   * STATE
   * ======================================================================== */
  const [games, setGames]     = useState<SavedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  /* ========================================================================
   * EFFECT: buscar apostas salvas ao montar o hook
   * ======================================================================== */
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/auth/saved-games', {
          credentials: 'include', // envia cookies de sessão
        })
        if (!response.ok) {
          throw new Error('Falha ao carregar apostas salvas')
        }
        const data = await response.json()
        // data.games é array de objetos { id, numbers: number[], createdAt }
        setGames(data.games || [])
      } catch (err: any) {
        console.error('[useSavedGames] erro ao carregar jogos:', err)
        setError(err.message || 'Erro interno')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  /* ========================================================================
   * FUNÇÃO: deleteGame
   * Exclui uma aposta salta pelo ID
   * ======================================================================== */
  const deleteGame = async (id: number) => {
    try {
      const response = await fetch(`/api/auth/saved-games/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao excluir aposta')
      }
      setGames(prev => prev.filter(game => game.id !== id))
    } catch (err: any) {
      console.error('[useSavedGames] erro ao excluir aposta:', err)
      throw err
    }
  }

  /* ========================================================================
   * RETORNO DO HOOK
   * ======================================================================== */
  return { games, loading, error, deleteGame }
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
