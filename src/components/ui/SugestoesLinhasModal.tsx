/* =============================================================================
 * ARQUIVO: src/components/ui/SugestoesLinhasModal.tsx
 * DESCRIÇÃO: Versão otimizada com estratégias melhoradas de geração
 *            + Funcionalidades de copiar todos e salvar jogos individuais
 * ============================================================================= */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaLightbulb, FaCopy, FaCheck, FaCog, 
  FaClipboardList, FaSpinner, FaSave 
} from 'react-icons/fa';

// --- Interfaces e Tipos ---
interface JogoGerado {
  id: number;
  matriz: string[][];
  score: number;
}
interface SugestoesLinhasModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onSaveGameRequest: (numbers: number[], gameId: number) => void;
  savingGameId: number | null;
  savedGameIds: number[];
}
type ResultadoHistorico = {
  dezenas: string;
  [key: string]: any;
};

const DEBUG = false;

export default function SugestoesLinhasModal({ 
  isOpen, 
  onClose,
  isLoggedIn,
  onSaveGameRequest,
  savingGameId,
  savedGameIds
}: SugestoesLinhasModalProps) {
  // --- Estados do Componente ---
  const [numJogos, setNumJogos] = useState<number>(6);
  const [jogosGerados, setJogosGerados] = useState<JogoGerado[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<number | null>(null);
  const [iterations, setIterations] = useState<number>(0);
  const [melhoriasEncontradas, setMelhoriasEncontradas] = useState<number>(0);
  const [updateKey, setUpdateKey] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [todosCopiados, setTodosCopiados] = useState<boolean>(false);
  const [localSavedGameIds, setLocalSavedGameIds] = useState<number[]>([]);

  // --- Estados para Cache de Dados ---
  const [dadosHistoricos, setDadosHistoricos] = useState<ResultadoHistorico[] | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  
  const isSearchingRef = useRef(false);

  // --- Cache das linhas processadas ---
  const [todasAsLinhasUnicas, setTodasAsLinhasUnicas] = useState<string[][]>([]);
  const [linhasMenosProvaveis, setLinhasMenosProvaveis] = useState<string[][]>([]);
  const [linhasMaisProvaveis, setLinhasMaisProvaveis] = useState<string[][]>([]);

  // --- Efeitos de Ciclo de Vida ---
  useEffect(() => {
    if (isOpen && !dadosHistoricos && !isLoadingData) {
      setIsLoadingData(true);
      setError(null);
      
      fetch('/api/resultados')
        .then(res => {
          if (!res.ok) throw new Error('Falha ao buscar o histórico.');
          return res.json();
        })
        .then(data => {
          setDadosHistoricos(data);
          
          // Processa e deduplica as linhas
          const todasAsLinhasRaw: string[][] = data.flatMap((r: ResultadoHistorico) => {
            if (typeof r.dezenas !== 'string') return [];
            const dezenasArray = r.dezenas.split(',');
            if (dezenasArray.length !== 15) return [];
            return [
              dezenasArray.slice(0, 5), 
              dezenasArray.slice(5, 10), 
              dezenasArray.slice(10, 15)
            ];
          });
          
          // Remove duplicatas mantendo a ordem de aparição
          const linhasUnicasSet = new Set<string>();
          const linhasUnicasArray: string[][] = [];
          
          for (const linha of todasAsLinhasRaw) {
            const chave = [...linha].sort().join(',');
            if (!linhasUnicasSet.has(chave)) {
              linhasUnicasSet.add(chave);
              linhasUnicasArray.push(linha);
            }
          }
          
          setTodasAsLinhasUnicas(linhasUnicasArray);
          
          // Calcula ranking das menos e mais prováveis
          const contagemLinhas = new Map<string, number>();
          todasAsLinhasRaw.forEach(linha => {
            const chave = [...linha].sort().join(',');
            contagemLinhas.set(chave, (contagemLinhas.get(chave) || 0) + 1);
          });
          
          const linhasOrdenadas = [...contagemLinhas.entries()].sort((a, b) => a[1] - b[1]);
          const menosProvaveis = linhasOrdenadas.slice(0, 20).map(item => item[0].split(','));
          const maisProvaveis = linhasOrdenadas.slice(-50).map(item => item[0].split(','));
          
          setLinhasMenosProvaveis(menosProvaveis);
          setLinhasMaisProvaveis(maisProvaveis);
          
          if (DEBUG) {
            console.log("Linhas totais (com duplicatas):", todasAsLinhasRaw.length);
            console.log("Linhas únicas:", linhasUnicasArray.length);
            console.log("Top 20 menos prováveis:", menosProvaveis.length);
            console.log("Top 50 mais prováveis:", maisProvaveis.length);
          }
        })
        .catch(err => {
          setError(err.message || 'Erro ao carregar dados históricos.');
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }

    if (!isOpen) {
      setDadosHistoricos(null);
      setTodasAsLinhasUnicas([]);
      setLinhasMenosProvaveis([]);
      setLinhasMaisProvaveis([]);
      setJogosGerados([]);
      setError(null);
      setProgresso(0);
      isSearchingRef.current = false;
      setTodosCopiados(false);
      setLocalSavedGameIds([]);
    }
  }, [isOpen, dadosHistoricos, isLoadingData]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Resetar IDs salvos quando novos jogos são gerados
  useEffect(() => {
    setLocalSavedGameIds([]);
  }, [jogosGerados]);

  // --- Função para copiar todos os jogos ---
  const copiarTodosJogos = useCallback(() => {
    if (jogosGerados.length === 0) return;
    
    // Formatação corrigida conforme solicitado
    const textoFormatado = jogosGerados.map(jogo => {
      const titulo = `${jogo.id}º Jogo:`;
      // Formata cada linha com espaços entre as dezenas
      const linhasFormatadas = jogo.matriz.map(linha => linha.join(' '));
      return `${titulo}\n${linhasFormatadas.join('\n')}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(textoFormatado).then(() => {
      setTodosCopiados(true);
      setTimeout(() => setTodosCopiados(false), 2000);
    });
  }, [jogosGerados]);

  // --- Função Principal de Geração Otimizada ---
  const handleGerarJogos = useCallback(async () => {
    if (!todasAsLinhasUnicas.length || !linhasMenosProvaveis.length) {
      setError("Os dados históricos ainda estão carregando.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setJogosGerados([]);
    setIterations(0);
    setMelhoriasEncontradas(0);
    setProgresso(0);
    isSearchingRef.current = true;
    setUpdateKey(0);

    try {
      const TIMEOUT_MS = 10000;
      const QTD_UNIVERSO_AMPLIADO = Math.min(100, todasAsLinhasUnicas.length);
      
      // Usa todas as linhas únicas disponíveis
      const universoCompleto = [...todasAsLinhasUnicas];
      
      // Sorteia uma linha rara para ser a "linha proibida"
      const linhaProibida = [...linhasMenosProvaveis[Math.floor(Math.random() * Math.min(10, linhasMenosProvaveis.length))]].sort();
      const linhaProibidaChave = linhaProibida.join(',');
      if (DEBUG) console.log("Linha Proibida:", linhaProibidaChave);

      // Função de pontuação melhorada
      const calculateScore = (grupoDeJogos: JogoGerado[]): number => {
        const dezenasCobertas = new Set<string>();
        let contemLinhaProibida = false;
        let scoreBonus = 0;

        for (const jogo of grupoDeJogos) {
          for (const linha of jogo.matriz) {
            if ([...linha].sort().join(',') === linhaProibidaChave) {
              contemLinhaProibida = true;
              break;
            }
            linha.forEach(dezena => dezenasCobertas.add(dezena));
          }
          if (contemLinhaProibida) break;
        }

        if (contemLinhaProibida) return -1;

        // Score baseado em diversidade + bonus por usar linhas menos prováveis
        let score = dezenasCobertas.size * 10;

        // Bonus por usar linhas raras
        grupoDeJogos.forEach(jogo => {
          jogo.matriz.forEach(linha => {
            const linhaStr = [...linha].sort().join(',');
            if (linhasMenosProvaveis.some(l => [...l].sort().join(',') === linhaStr)) {
              score += 5; // Bonus por usar linha rara
            }
          });
        });

        return score;
      };

      // Estratégia de geração inteligente
      const gerarJogoInteligente = (): string[][] | null => {
        const tentativasMax = 100;
        
        for (let tentativa = 0; tentativa < tentativasMax; tentativa++) {
          let linhasSelecionadas: string[][] = [];
          
          // Estratégia 1: 70% usa linhas menos prováveis, 30% usa qualquer linha
          const estrategia = Math.random() < 0.7 ? 'menosProvaveis' : 'aleatorio';
          
          if (estrategia === 'menosProvaveis' && linhasMenosProvaveis.length >= 3) {
            // Tenta usar 1-2 linhas menos prováveis
            const indices = [];
            indices.push(Math.floor(Math.random() * linhasMenosProvaveis.length));
            
            let segundoIndice;
            do {
              segundoIndice = Math.floor(Math.random() * linhasMenosProvaveis.length);
            } while (segundoIndice === indices[0]);
            indices.push(segundoIndice);
            
            indices.push(Math.floor(Math.random() * universoCompleto.length));
            
            linhasSelecionadas = [
              linhasMenosProvaveis[indices[0]],
              linhasMenosProvaveis[indices[1]],
              universoCompleto[indices[2]]
            ];
          } else {
            // Seleção aleatória do universo completo
            const indices = [];
            while (indices.length < 3) {
              const idx = Math.floor(Math.random() * universoCompleto.length);
              if (!indices.includes(idx)) indices.push(idx);
            }
            
            linhasSelecionadas = indices.map(idx => universoCompleto[idx]);
          }

          // Verifica se forma um jogo válido (15 dezenas únicas)
          const dezenasUnicas = new Set(linhasSelecionadas.flat());
          if (dezenasUnicas.size === 15) {
            // Verifica se não contém linha proibida
            const temLinhaProibida = linhasSelecionadas.some(linha => 
              [...linha].sort().join(',') === linhaProibidaChave
            );
            
            if (!temLinhaProibida) {
              return linhasSelecionadas.map(l => [...l].sort()).sort((a, b) => a[0].localeCompare(b[0]));
            }
          }
        }
        
        return null;
      };

      // Busca iterativa com estratégias múltiplas
      let bestGroup: JogoGerado[] | null = null;
      let bestScore = -1;
      let iterationCount = 0;
      const startTime = Date.now();

      while (Date.now() - startTime < TIMEOUT_MS && isSearchingRef.current) {
        const currentGroup: JogoGerado[] = [];
        let groupValid = true;
        
        // Gera cada jogo individualmente
        for (let i = 0; i < numJogos; i++) {
          const jogoValido = gerarJogoInteligente();
          
          if (jogoValido) {
            currentGroup.push({ id: i + 1, matriz: jogoValido, score: 0 });
          } else {
            groupValid = false;
            break;
          }
        }

        if (groupValid && currentGroup.length === numJogos) {
          const currentScore = calculateScore(currentGroup);
          
          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestGroup = currentGroup.map(jogo => ({...jogo, score: currentScore}));
            setJogosGerados(bestGroup);
            setUpdateKey(key => key + 1);
            setMelhoriasEncontradas(count => count + 1);
          }
        }
        
        iterationCount++;
        
        if (iterationCount % 50 === 0) {
          setIterations(iterationCount);
          setProgresso(Math.min(100, ((Date.now() - startTime) / TIMEOUT_MS) * 100));
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      setIterations(iterationCount);
      setProgresso(100);
      
      if (!bestGroup || bestGroup.length < numJogos) {
        // Tenta gerar pelo menos alguns jogos se não conseguiu o número completo
        const jogosParciais = [];
        for (let i = 0; i < Math.min(3, numJogos); i++) {
          const jogoValido = gerarJogoInteligente();
          if (jogoValido) {
            jogosParciais.push({ id: i + 1, matriz: jogoValido, score: 0 });
          }
        }
        
        if (jogosParciais.length > 0) {
          setJogosGerados(jogosParciais);
        } else {
          setError("Não foi possível gerar jogos válidos. Tente novamente.");
        }
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
      isSearchingRef.current = false;
    }
  }, [numJogos, todasAsLinhasUnicas, linhasMenosProvaveis, linhasMaisProvaveis]);

  const copiarJogo = useCallback((matriz: string[][], id: number) => {
    const texto = matriz.map(linha => linha.join("\t")).join("\n");
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    });
  }, []);

  // --- Função para salvar um jogo específico ---
  const handleSaveGame = (jogo: JogoGerado) => {
    const numeros = jogo.matriz.flat().map(Number);
    onSaveGameRequest(numeros, jogo.id);
    setLocalSavedGameIds(prev => [...prev, jogo.id]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden"
          >
            <div className="p-6 pb-4 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-600 to-amber-700 p-2 rounded-xl">
                    <FaLightbulb className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      Sugestões por Linhas
                    </span>
                  </h2>
                </div>
                <button
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
                  onClick={onClose}
                  aria-label="Fechar modal"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-4">
                {isLoadingData ? (
                  <div className="text-center text-amber-300">Carregando dados históricos...</div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <label className="block text-amber-300 mb-2">
                          Quantidade de Jogos (Máx: 12)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="12"
                            value={numJogos}
                            onChange={(e) => setNumJogos(parseInt(e.target.value))}
                            className="w-full max-w-xs accent-amber-500"
                            disabled={isLoading}
                          />
                          <span className="bg-amber-900/50 px-3 py-1 rounded-lg text-white font-bold w-12 text-center">
                            {numJogos}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleGerarJogos}
                        disabled={isLoading || isLoadingData}
                        className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-700 text-white rounded-xl hover:from-amber-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-500/20 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (<FaCog className="animate-spin" />) : (<FaLightbulb />)}
                        <span>{isLoading ? 'Otimizando...' : 'Otimizar Jogos'}</span>
                      </button>
                    </div>
                    
                    {isLoading && (
                      <div className="text-center mt-3 text-amber-300 text-sm space-y-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progresso}%` }}
                          ></div>
                        </div>
                        <p>Analisando {iterations.toLocaleString('pt-BR')} combinações...</p>
                        <p className='text-green-400 font-semibold'>Melhorias encontradas: {melhoriasEncontradas}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 text-red-200">
                  {error}
                </div>
              )}

              {jogosGerados.length > 0 && (
                <div>
                  {!isLoading && (
                    <div className="mb-4 text-center">
                      <p className="text-green-300">
                        ✓ {jogosGerados.length} jogo(s) gerado(s) com sucesso!
                      </p>
                      {melhoriasEncontradas > 0 && (
                        <p className='text-gray-400 text-sm'>
                          (Melhoria encontrada após {iterations.toLocaleString('pt-BR')} análises)
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Botão Copiar Todos */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Jogos Sugeridos</h3>
                    <button 
                      onClick={copiarTodosJogos} 
                      disabled={todosCopiados}
                      className="flex items-center gap-2 text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-green-600"
                    >
                      {todosCopiados ? <FaCheck /> : <FaClipboardList />}
                      {todosCopiados ? 'Copiado!' : 'Copiar Todos'}
                    </button>
                  </div>
                  
                  <div key={updateKey} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jogosGerados.map((jogo) => (
                      <motion.div
                        key={jogo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-800 border border-yellow-500/20 rounded-xl p-4 hover:border-amber-500/50 transition-all cursor-pointer relative"
                        onClick={() => copiarJogo(jogo.matriz, jogo.id)}
                      >
                        {copiadoId === jogo.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-900/80 rounded-xl"
                          >
                            <FaCheck className="text-white text-2xl mr-2" />
                            <span className="text-white font-bold">Copiado!</span>
                          </motion.div>
                        )}
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-amber-300">Sugestão {jogo.id}</h4>
                          <span className="text-xs text-gray-400">Clique para copiar</span>
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex gap-2 mb-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copiarJogo(jogo.matriz, jogo.id);
                            }}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                          >
                            {copiadoId === jogo.id ? <FaCheck /> : <FaCopy />}
                            {copiadoId === jogo.id ? 'Copiado' : 'Copiar'}
                          </button>
                          
                          {/* Botão Salvar - CORREÇÃO PRINCIPAL AQUI */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveGame(jogo);
                            }}
                            disabled={!isLoggedIn || savingGameId === jogo.id || localSavedGameIds.includes(jogo.id)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                              isLoggedIn 
                                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            } ${(savingGameId === jogo.id || localSavedGameIds.includes(jogo.id)) ? 'opacity-50' : ''}`}
                          >
                            {savingGameId === jogo.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : localSavedGameIds.includes(jogo.id) ? (
                              <FaCheck />
                            ) : (
                              <FaSave />
                            )}
                            {savingGameId === jogo.id ? 'Salvando...' : 
                              localSavedGameIds.includes(jogo.id) ? 'Salvo' : 
                              isLoggedIn ? 'Salvar' : 'Login para Salvar'}
                          </button>
                        </div>
                        
                        <div className="space-y-1.5">
                          {jogo.matriz.map((linha, idx) => (
                            <div key={idx} className="flex justify-between">
                              {linha.map(num => (
                                <span key={num} className="flex items-center justify-center w-9 h-9 bg-gray-700 rounded-md font-mono text-white">
                                  {num}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-yellow-500/20 bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {todasAsLinhasUnicas.length > 0 && `${todasAsLinhasUnicas.length} linhas únicas disponíveis`}
                </div>
                <button
                  className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}