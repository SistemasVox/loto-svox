/* =============================================================================
 * ARQUIVO: src/app/minha-conta/meus-jogos/page.tsx
 * DESCRIÇÃO: Página "Meus Jogos Salvos" com valor monetário acumulado simulado
 * ============================================================================= */

'use client'

/* =============================================================================
 * IMPORTS
 * ============================================================================= */
import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
// NOVO ÍCONE ADICIONADO AQUI
import { FaArrowLeft, FaSave, FaCalendar, FaLightbulb, FaPlus, FaThList } from 'react-icons/fa'
import useSound from 'use-sound'
import { useAuth } from '@/hooks/useAuth'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import ManualGameModal from '@/components/ui/ManualGameModal' // Novo modal manual

/* =============================================================================
 * COMPONENTES LAZY
 * ============================================================================= */
const SavedGameCard = lazy(() => import('./components/SavedGameCard'))
const EmptyState    = lazy(() => import('./components/EmptyState'))
const SugestoesModal = lazy(() => import('@/components/ui/SugestoesModal'))
// NOVA IMPORTAÇÃO DO MODAL DE LINHAS
const SugestoesLinhasModal = lazy(() => import('@/components/ui/SugestoesLinhasModal'))


/* =============================================================================
 * DEBUG
 * ============================================================================= */
const DEBUG = false

/* =============================================================================
 * HOOK: useLoadingDelay – Loading visual mínimo de 1.5s monocromático/azul
 * ============================================================================= */
function useLoadingDelay(loadingFlag: boolean) {
  const [showLoading, setShowLoading] = useState(true)
  useEffect(() => {
    if (!loadingFlag) {
      const timer = setTimeout(() => setShowLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [loadingFlag])
  return showLoading && loadingFlag
}

/* =============================================================================
 * COMPONENTE PRINCIPAL: MeusJogosPage
 * ============================================================================= */
export default function MeusJogosPage() {
  /* ========================================================================
   * AUTH & REDIRECT
   * ======================================================================== */
  const { isLoggedIn, loading: authLoading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const showAuthLoading = useLoadingDelay(authLoading)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authLoading, isLoggedIn, pathname, router])

  /* ========================================================================
   * STATE
   * ======================================================================== */
  interface SavedGame {
    id: number
    concurso: number
    numbers: number[]
    createdAt: string
    valorTotal?: number
    valorTotalHistorico?: number
  }
  
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [loading, setLoading]       = useState(true)
  const [simulando, setSimulando]   = useState(false)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [page, setPage]             = useState(1)
  const perPage = 9
  
  // Estado para controlar o modal de sugestões
  const [sugestoesModalOpen, setSugestoesModalOpen] = useState(false);
  
  // Estados para gerenciar salvamento no modal de sugestões
  const [savingGameId, setSavingGameId] = useState<number | null>(null);
  const [savedGameIds, setSavedGameIds] = useState<number[]>([]);
  const [currentConcurso, setCurrentConcurso] = useState<number | null>(null);

  // Estado para forçar recarregamento dos jogos
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estados para o modal manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  
  // NOVO ESTADO PARA O MODAL DE SUGESTÕES POR LINHAS
  const [sugestoesLinhasModalOpen, setSugestoesLinhasModalOpen] = useState(false);


  /* ========================================================================
   * SONS
   * ======================================================================== */
  const [playHover]   = useSound('/sounds/beep-1.mp3', { volume: 0.5 })
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.3 })

  /* ========================================================================
   * FUNÇÃO: Carregar jogos salvos e simular valores acumulados
   * ======================================================================== */
  const loadSavedGames = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/auth/saved-games', {
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Falha ao carregar jogos')
      }
      
      const data = await res.json()
      const games: SavedGame[] = data.games || []
      
      setSimulando(true)
      const gamesComValores = await Promise.all(
        games.map(async (game) => {
          try {
            const valorDesdeCriacao = await simularValorTotal(game.concurso, game.numbers);
            const valorHistorico = await simularValorTotal(game.concurso, game.numbers, true);
            
            return { 
              ...game, 
              valorTotal: valorDesdeCriacao,
              valorTotalHistorico: valorHistorico 
            }
          } catch (error) {
            console.error('Erro na simulação:', error)
            return game
          }
        })
      )
      
      setSavedGames(gamesComValores)
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar jogos')
    } finally {
      setLoading(false)
      setSimulando(false)
    }
  }

  /* ========================================================================
   * FETCH: carregar jogos salvos e simular valores acumulados
   * ======================================================================== */
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    loadSavedGames();
  }, [authLoading, isLoggedIn, refreshTrigger]);

  /* ========================================================================
   * FUNÇÃO: Simular valor acumulado para um jogo
   * ======================================================================== */
  const simularValorTotal = async (concurso: number, numbers: number[], historicoCompleto = false): Promise<number> => {
    try {
      const body: any = {
        jogo: numbers,
      };

      if (historicoCompleto) {
        body.periodo = 'completo';
      } else {
        body.concursoInicial = concurso;
      }
      
      const response = await fetch('/api/analise-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Falha na simulação de valor acumulado')
      }

      const data = await response.json()
      return data.valorTotal || 0
    } catch (error) {
      console.error('Erro na simulação de valor acumulado:', error)
      return 0
    }
  }

  /* ========================================================================
   * HANDLER: excluir aposta
   * ======================================================================== */
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation()
  const handleDeleteGame = async (genericId: number, realId: number) => {
    try {
      await showConfirmation(
        {
          title: 'Excluir Aposta',
          message: `Deseja excluir a aposta ${genericId}?`,
          confirmText: 'Sim, excluir',
          cancelText: 'Cancelar',
          type: 'danger',
        },
        async () => {
          const res = await fetch(`/api/auth/saved-games/${realId}`, {
            method: 'DELETE',
            credentials: 'include',
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Falha ao excluir aposta')
          }
          setSavedGames(prev => prev.filter(g => g.id !== realId))
          playSuccess()
        }
      )
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir aposta')
    }
  }
  
  /* ========================================================================
   * Buscar o último concurso para salvar jogos corretamente
   * ======================================================================== */
  useEffect(() => {
    const fetchLastConcurso = async () => {
      try {
        const res = await fetch('/api/resultados');
        const data = await res.json();
        if (data.length > 0) {
          const maxConcurso = Math.max(...data.map((c: any) => c.concurso));
          setCurrentConcurso(maxConcurso);
        }
      } catch (error) {
        console.error('Erro ao buscar último concurso:', error);
      }
    };

    fetchLastConcurso();
  }, []);

  /* ========================================================================
   * Função para salvar jogo do modal de sugestões
   * ======================================================================== */
  const handleSaveGameRequest = async (numbers: number[], gameId: number) => {
    if (!currentConcurso) {
      alert('Aguardando carregar o número do concurso...');
      return;
    }

    if (savedGameIds.includes(gameId)) {
      return;
    }

    setSavingGameId(gameId);
    try {
      const res = await fetch('/api/auth/saved-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          numbers: numbers,
          concurso: currentConcurso,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao salvar jogo');
      }

      // Força recarregamento dos jogos
      setRefreshTrigger(prev => prev + 1);
      setSavedGameIds(prev => [...prev, gameId]);

    } catch (error: any) {
      console.error('Erro ao salvar jogo:', error);
      alert(error.message || 'Erro ao salvar jogo. Tente novamente.');
    } finally {
      setSavingGameId(null);
    }
  };

  /* ========================================================================
   * Função para fechar o modal de sugestões
   * ======================================================================== */
  const handleCloseSugestoesModal = () => {
    setSugestoesModalOpen(false);
  };

  /* ========================================================================
   * Função para salvar jogo manual
   * ======================================================================== */
  const saveManualGame = async (numbers: number[]) => {
    if (!currentConcurso) {
      alert('Aguardando carregar o número do concurso...');
      return false;
    }

    setSavingManual(true);
    try {
      const res = await fetch('/api/auth/saved-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          numbers: numbers,
          concurso: currentConcurso,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao salvar jogo');
      }

      // Força recarregamento dos jogos
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar jogo manual:', error);
      alert(error.message || 'Erro ao salvar jogo. Tente novamente.');
      return false;
    } finally {
      setSavingManual(false);
    }
  };

  /* ========================================================================
   * PAGINAÇÃO
   * ======================================================================== */
  const total = savedGames.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const current = savedGames.slice(start, start + perPage)

  /* ========================================================================
   * RENDERIZAÇÃO
   * ======================================================================== */
  if (showAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white mb-2">Meus Jogos Salvos</span>
        <span className="text-lg text-gray-300 mb-1">Autenticando usuário…</span>
        <span className="text-sm text-gray-500">Aguarde :)</span>
      </div>
    )
  }
  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <Link
          href="/minha-conta"
          onMouseEnter={playHover}
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <FaArrowLeft /> Voltar
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Meus Jogos Salvos
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-full py-2 px-4">
              <FaSave className="text-yellow-400" />
              <span className="text-gray-300 font-medium">
                {total} {total === 1 ? 'aposta' : 'apostas'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setManualModalOpen(true)}
                onMouseEnter={playHover}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-md hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                <FaPlus />
                <span>Manual</span>
              </button>
              {/* NOVO BOTÃO "LINHAS" ADICIONADO AQUI */}
              <button
                onClick={() => setSugestoesLinhasModalOpen(true)}
                onMouseEnter={playHover}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-semibold shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all"
              >
                <FaThList />
                <span>Linhas</span>
              </button>
              <button
                onClick={() => setSugestoesModalOpen(true)}
                onMouseEnter={playHover}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-semibold shadow-md hover:from-yellow-600 hover:to-amber-700 transition-all"
              >
                <FaLightbulb />
                <span>Sugestão</span>
              </button>
            </div>
          </div>
        </div>

        {/* ERRO */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300">{errorMsg}</p>
          </div>
        )}

        {/* LISTAGEM */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              <span className="text-lg text-white">Carregando jogos salvos…</span>
            </div>
          }
        >
          {loading || simulando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(perPage)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 border border-gray-700 rounded-xl animate-pulse p-5 h-48"
                />
              ))}
            </div>
          ) : total === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {current.map((game, idx) => {
                  const genericId = start + idx + 1
                  return (
                    <div key={game.id} className="space-y-2">
                      <SavedGameCard
                        game={{
                          id:        genericId,
                          numbers:   game.numbers,
                          createdAt: game.createdAt,
                          valorTotal: game.valorTotal,
                          valorTotalHistorico: game.valorTotalHistorico
                        }}
                        onDelete={() => handleDeleteGame(genericId, game.id)}
                        onHover={playHover}
                      />
                    </div>
                  )
                })}
              </div>

              {/* PAGINAÇÃO */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-current={page === p ? 'page' : undefined}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                        page === p
                          ? 'bg-blue-600 text-white scale-110 ring-2 ring-cyan-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                      onMouseEnter={playHover}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Suspense>

        {/* MODAL DE CONFIRMAÇÃO */}
        <ConfirmationModal
          isOpen={confirmationState.isOpen}
          onClose={hideConfirmation}
          onConfirm={confirmationState.onConfirm}
          title={confirmationState.title}
          message={confirmationState.message}
          confirmText={confirmationState.confirmText}
          cancelText={confirmationState.cancelText}
          type={confirmationState.type}
          loading={confirmationState.loading}
        />
        
        {/* Modal de Sugestões */}
        {sugestoesModalOpen && (
            <Suspense fallback={null}>
                <SugestoesModal
                    isOpen={sugestoesModalOpen}
                    onClose={handleCloseSugestoesModal}
                    isLoggedIn={isLoggedIn}
                    onSaveGameRequest={handleSaveGameRequest}
                    savingGameId={savingGameId}
                    savedGameIds={savedGameIds}
                />
            </Suspense>
        )}

        {/* Modal Manual */}
        <ManualGameModal
          isOpen={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          onSave={saveManualGame}
          saving={savingManual}
        />
        
        {/* NOVO MODAL DE SUGESTÕES POR LINHAS (A SER IMPLEMENTADO) */}
        {sugestoesLinhasModalOpen && (
          <Suspense fallback={null}>
            <SugestoesLinhasModal
              isOpen={sugestoesLinhasModalOpen}
              onClose={() => setSugestoesLinhasModalOpen(false)}
              // isLogged, onSave, etc, serão adicionados no futuro
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}