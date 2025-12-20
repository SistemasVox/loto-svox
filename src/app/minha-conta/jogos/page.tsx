/* =============================================================================
 * ARQUIVO: src/app/minha-conta/jogos/page.tsx
 * DESCRIÇÃO: Página de resumo dos jogos salvos (modelo Bet) – exibe contagem
 * ============================================================================= */

'use client'

/* =============================================================================
 * IMPORTS
 * ============================================================================= */
import React from 'react'
import { FaSpinner } from 'react-icons/fa'
import { useSavedGames } from './useSavedGames'
import ResumoJogos from './ResumoJogos'

/* =============================================================================
 * COMPONENTE PRINCIPAL: JogosResumoPage
 * ============================================================================= */
export default function JogosResumoPage() {
  /* =========================================================================
   * HOOK: buscar apostas salvas via API
   * ========================================================================= */
  const { games, loading, error } = useSavedGames()

  /* =========================================================================
   * RENDER: carregamento
   * ========================================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
      </div>
    )
  }

  /* =========================================================================
   * RENDER: erro ao carregar
   * ========================================================================= */
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">
          Erro ao carregar apostas: {error}
        </p>
      </div>
    )
  }

  /* =========================================================================
   * RENDER: resumo dos jogos salvos
   * ========================================================================= */
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Seus Jogos (Resumo)
      </h1>
      {/* Passa total de apostas salvas para o componente de resumo */}
      <ResumoJogos total={games.length} />
    </div>
  )
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
