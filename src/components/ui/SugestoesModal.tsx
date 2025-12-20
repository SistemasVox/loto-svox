/* =============================================================================
 * ARQUIVO: src/components/ui/SugestoesModal.tsx
 * DESCRIÇÃO: Modal para exibir o melhor GRUPO de jogos, com lógica de loading corrigida.
 *            Agora com botão “Novo Grupo” ao lado esquerdo de “Continuar Evolução”.
 * ============================================================================= */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaCalendarAlt, FaCopy, FaCheck, 
  FaSpinner, FaUsers, FaSync, FaClipboardList, FaSave 
} from "react-icons/fa";

// Tipos de dados
interface JogoSugerido {
  rank: number;
  dezenas: string[];
}
interface DesempenhoGrupo {
    premioTotal: number;
    custoTotal: number;
    retorno: number;
}
interface SugestoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onSaveGameRequest: (numbers: number[], gameId: number) => void;
  savingGameId: number | null;
  savedGameIds: number[];
}

const PERIODOS = [3, 6, 12, 18, 24];

export default function SugestoesModal({ 
  isOpen, 
  onClose,
  isLoggedIn,
  onSaveGameRequest,
  savingGameId,
  savedGameIds
}: SugestoesModalProps) {
  const [periodo, setPeriodo] = useState<number>(12);
  const [grupoSugerido, setGrupoSugerido] = useState<JogoSugerido[]>([]);
  const [desempenho, setDesempenho] = useState<DesempenhoGrupo | null>(null);
  const [concursosAnalisados, setConcursosAnalisados] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jogoCopiado, setJogoCopiado] = useState<number | null>(null);
  const [todosCopiados, setTodosCopiados] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [localSavedGameIds, setLocalSavedGameIds] = useState<number[]>([]);

  // ATUALIZAÇÃO: Lógica de loading corrigida dentro da função.
  const fetchSugestoes = useCallback(async (numConcursos: number, options?: { grupoInicial?: JogoSugerido[], signal?: AbortSignal }) => {
    setLoading(true);
    setError(null);
    
    if (!options?.grupoInicial) {
        setGrupoSugerido([]);
        setDesempenho(null);
    }

    try {
      const body = {
        numConcursos: numConcursos,
        grupoInicial: options?.grupoInicial ? options.grupoInicial.map(j => j.dezenas) : undefined,
      };

      const response = await fetch(`/api/sugestoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: options?.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao buscar sugestões.");
      }

      const data = await response.json();
      setGrupoSugerido(data.sugestoes || []);
      setDesempenho(data.desempenhoGrupo || null);
      setConcursosAnalisados(data.concursosAnalisados || 0);
      
      // Desativa o loading apenas em caso de sucesso
      setLoading(false);
      setIsInitialLoad(false);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Se a requisição foi abortada, não fazemos nada.
        // A próxima requisição (da remontagem) irá gerenciar o estado de loading.
        console.log('Fetch abortado, aguardando próxima requisição.');
        return;
      }
      
      // Se for um erro real, desativamos o loading e mostramos a mensagem.
      setError(err.message);
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Busca inicial quando o modal é aberto
  useEffect(() => {
    if (isOpen && isInitialLoad) {
      const controller = new AbortController();
      fetchSugestoes(periodo, { signal: controller.signal });

      return () => {
        controller.abort();
      };
    }
  }, [isOpen, periodo, fetchSugestoes, isInitialLoad]);
  
  // Atualização de período sem duplicar chamadas
  useEffect(() => {
    if (isOpen && !isInitialLoad) {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        fetchSugestoes(periodo, { signal: controller.signal });
      }, 300);
      
      return () => {
        controller.abort();
        clearTimeout(timer);
      };
    }
  }, [periodo]);
  
  // Resetar IDs salvos quando novos jogos são gerados
  useEffect(() => {
    setLocalSavedGameIds([]);
  }, [grupoSugerido]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsInitialLoad(true);
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => { 
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const copiarJogo = (dezenas: string[], rank: number) => {
    navigator.clipboard.writeText(dezenas.join(" ")).then(() => {
      setJogoCopiado(rank);
      setTimeout(() => setJogoCopiado(null), 2000);
    });
  };
  
  const copiarTodosJogos = useCallback(() => {
    if (grupoSugerido.length === 0) return;
    const textoFormatado = grupoSugerido.map(jogo => {
        const titulo = `${jogo.rank}º Jogo:`;
        const dezenas = jogo.dezenas;
        const linha1 = dezenas.slice(0, 5).join(' ');
        const linha2 = dezenas.slice(5, 10).join(' ');
        const linha3 = dezenas.slice(10, 15).join(' ');
        return `${titulo}\n${linha1}\n${linha2}\n${linha3}`;
    }).join('\n\n');
    navigator.clipboard.writeText(textoFormatado).then(() => {
        setTodosCopiados(true);
        setTimeout(() => setTodosCopiados(false), 2000);
    });
  }, [grupoSugerido]);
  
  const formatarValor = (valor: number) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleContinuarEvolucao = () => {
      fetchSugestoes(periodo, { grupoInicial: grupoSugerido });
  };

  // === NOVO: gera um grupo do zero mantendo o período escolhido ===
  const novoGrupo = () => {
    fetchSugestoes(periodo);
  };

  // Função para salvar um jogo individual
  const handleSaveGame = (jogo: JogoSugerido) => {
    // Converte as dezenas (string) para números
    const numeros = jogo.dezenas.map(Number);
    onSaveGameRequest(numeros, jogo.rank);
    // Adiciona o ID do jogo à lista local de salvos
    setLocalSavedGameIds(prev => [...prev, jogo.rank]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 flex flex-col"
          >
            <div className="p-6 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-2 rounded-xl"><FaUsers className="text-white text-xl" /></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    Melhor Grupo de Jogos
                  </h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full"><FaTimes size={20} /></button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <label className="flex items-center gap-2 text-amber-300 mb-2"><FaCalendarAlt/> Período de Análise</label>
                <div className="flex flex-wrap gap-2">
                  {PERIODOS.map(p => (
                    <button key={p} onClick={() => setPeriodo(p)} disabled={loading} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${periodo === p ? 'bg-amber-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      {p} concursos
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center text-white h-64">
                  <FaSpinner className="animate-spin text-3xl mb-3 text-amber-500"/>
                  <span>Evoluindo o melhor grupo de jogos...</span>
                  <span className="text-sm text-gray-400">(Isso pode levar até 30 segundos)</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>
              ) : grupoSugerido.length === 0 ? (
                <div className="text-center text-gray-400 p-4 bg-gray-800/50 rounded-lg">Nenhuma sugestão encontrada. Tente um período maior.</div>
              ) : (
              <>
                {desempenho && (
                  <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-center text-amber-400 mb-3">Desempenho do Grupo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                      <div className="p-2 bg-red-900/50 rounded-lg"><div className="text-xs text-red-300">Custo Total</div><div className="font-bold text-white text-md">{formatarValor(desempenho.custoTotal)}</div></div>
                      <div className="p-2 bg-green-900/50 rounded-lg"><div className="text-xs text-green-300">Prêmio Simulado</div><div className="font-bold text-white text-md">{formatarValor(desempenho.premioTotal)}</div></div>
                      <div className={`p-2 rounded-lg ${desempenho.retorno >= 0 ? 'bg-blue-900/50' : 'bg-gray-700'}`}><div className={`text-xs ${desempenho.retorno >= 0 ? 'text-blue-300' : 'text-gray-400'}`}>Retorno Final</div><div className="font-bold text-white text-md">{formatarValor(desempenho.retorno)}</div></div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Jogos do Grupo</h3>
                  <button onClick={copiarTodosJogos} disabled={todosCopiados} className="flex items-center gap-2 text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-green-600">
                    {todosCopiados ? <FaCheck/> : <FaClipboardList/>}
                    {todosCopiados ? 'Copiado!' : 'Copiar Todos'}
                  </button>
                </div>
                <div className="space-y-4">
                  {grupoSugerido.map(jogo => (
                    <div key={jogo.rank} className="bg-gray-800/70 border border-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-md text-amber-400">Jogo #{jogo.rank}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => copiarJogo(jogo.dezenas, jogo.rank)} className="flex items-center gap-2 text-xs px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                            {jogoCopiado === jogo.rank ? <FaCheck/> : <FaCopy/>}
                            {jogoCopiado === jogo.rank ? 'Copiado' : 'Copiar'}
                          </button>
                          {/* Botão para salvar o jogo */}
                          {isLoggedIn && (
                            <button 
                              onClick={() => handleSaveGame(jogo)}
                              disabled={savingGameId === jogo.rank || localSavedGameIds.includes(jogo.rank)}
                              className="flex items-center gap-2 text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {savingGameId === jogo.rank ? (
                                <FaSpinner className="animate-spin" />
                              ) : localSavedGameIds.includes(jogo.rank) ? (
                                <FaCheck />
                              ) : (
                                <FaSave />
                              )}
                              {savingGameId === jogo.rank ? 'Salvando...' : localSavedGameIds.includes(jogo.rank) ? 'Salvo' : 'Salvar'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {jogo.dezenas.map(d => (<div key={d} className="flex items-center justify-center h-8 rounded-md bg-gray-700 font-mono text-white">{d}</div>))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
              )}
            </div>

            {/* FOOTER COM OS DOIS BOTÕES */}
            <div className="p-4 border-t border-yellow-500/20 bg-gray-900/50 flex justify-center gap-3">
              {/* === NOVO BOTÃO === */}
              <button
                onClick={novoGrupo}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50"
              >
                Novo Grupo
              </button>

              {/* botão já existente */}
              <button
                onClick={handleContinuarEvolucao}
                disabled={loading || grupoSugerido.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Continuar Evolução
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}