/* =============================================================================
 * ARQUIVO: src/components/ui/CriadorJogosModal.tsx
 * DESCRIÇÃO: Modal para criação de jogos filhos usando algoritmos genéticos
 * ============================================================================= */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaDna, FaRandom, FaCopy, FaCheck, FaClipboardList } from "react-icons/fa";

interface Jogo {
  id: number;
  matriz: string[][]; // Matriz 3x5
}

interface CriadorJogosModalProps {
  isOpen: boolean;
  onClose: () => void;
  paisIniciais?: string[][][]; // Nova prop opcional
}

// Nova interface para representar uma coluna
interface Coluna {
  paiIndex: number;
  colunaIndex: number;
  numeros: string[];
}

export default function CriadorJogosModal({
  isOpen,
  onClose,
  paisIniciais // Recebemos a prop
}: CriadorJogosModalProps) {
  // Estados
  const [pais, setPais] = useState<string[][][]>([
    [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")],
    [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")],
    [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")]
  ]);
  
  const [numFilhos, setNumFilhos] = useState<number>(10);
  const [filhos, setFilhos] = useState<Jogo[]>([]);
  const [jogoCopiado, setJogoCopiado] = useState<number | null>(null);
  const [todosCopiados, setTodosCopiados] = useState<boolean>(false);
  const [erro, setErro] = useState<string>("");
  const [numerosForaConjunto, setNumerosForaConjunto] = useState<string[]>([]);

  // Atualizar os pais quando a prop paisIniciais mudar
  useEffect(() => {
    if (paisIniciais) {
      setPais(paisIniciais);
    } else {
      // Resetar para o estado inicial vazio se paisIniciais for nulo (modo manual)
      setPais([
        [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")],
        [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")],
        [Array(5).fill(""), Array(5).fill(""), Array(5).fill("")]
      ]);
    }
  }, [paisIniciais]);

  // Resetar estados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setFilhos([]);
      setErro("");
      setJogoCopiado(null);
      setTodosCopiados(false);
      setNumerosForaConjunto([]);
    }
  }, [isOpen]);

  // Impedir scroll do body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Função para encontrar números fora do conjunto comum
  const encontrarNumerosForaConjunto = useCallback(() => {
    const todosNumeros = pais.flat(2).filter(num => num.trim() !== "");
    const contagem: Record<string, number> = {};
    
    todosNumeros.forEach(num => {
      contagem[num] = (contagem[num] || 0) + 1;
    });
    
    const numerosComuns = Object.keys(contagem).filter(num => contagem[num] === 3);
    const numerosFora = Object.keys(contagem).filter(num => contagem[num] !== 3);
    
    return numerosFora;
  }, [pais]);

  // Atualizar números fora do conjunto sempre que os pais mudarem
  useEffect(() => {
    if (isOpen) {
      const numerosFora = encontrarNumerosForaConjunto();
      setNumerosForaConjunto(numerosFora);
    }
  }, [pais, isOpen, encontrarNumerosForaConjunto]);

  // Validar e extrair números únicos dos pais
  const validarPais = useCallback(() => {
    const todosNumeros: string[] = [];
    let camposVazios = 0;
    let numerosInvalidos = false;

    // Percorrer todos os campos dos pais
    for (let paiIndex = 0; paiIndex < pais.length; paiIndex++) {
      const pai = pais[paiIndex];
      const numerosPai = new Set<string>();
      
      for (let linhaIndex = 0; linhaIndex < pai.length; linhaIndex++) {
        const linha = pai[linhaIndex];
        
        for (let colIndex = 0; colIndex < linha.length; colIndex++) {
          const numero = linha[colIndex];
          const numLimpo = numero.trim();
          
          if (numLimpo === "") {
            camposVazios++;
          } else {
            // Verificar se é um número válido (dois dígitos)
            if (!/^\d{2}$/.test(numLimpo)) {
              numerosInvalidos = true;
            }
            todosNumeros.push(numLimpo);
            numerosPai.add(numLimpo);
          }
        }
      }
      
      // Verificar se este pai tem exatamente 15 números únicos
      if (numerosPai.size !== 15) {
        return { 
          error: `O Pai ${paiIndex+1} tem ${numerosPai.size} números únicos. Cada pai deve ter exatamente 15 números únicos.` 
        };
      }
    }

    // Verificar campos vazios
    if (camposVazios > 0) {
      return { 
        error: `Existem ${camposVazios} campos vazios. Preencha todos os campos com números de dois dígitos.` 
      };
    }

    // Verificar números inválidos
    if (numerosInvalidos) {
      return { 
        error: "Alguns números não são válidos. Todos devem ser de dois dígitos (ex: 01, 25)." 
      };
    }

    return { error: null };
  }, [pais]);

  // Função para extrair uma coluna de um pai
  const extrairColuna = useCallback((pai: string[][], colIndex: number): string[] => {
    return [pai[0][colIndex], pai[1][colIndex], pai[2][colIndex]];
  }, []);

  // Gerar um filho por cruzamento de colunas
  const gerarFilhoPorColunas = useCallback((maxTentativas: number): string[][] | null => {
    const MAX_COLUNAS_POR_PAI = 4; // Máximo de colunas que um pai pode contribuir
    const numerosUsados = new Set<string>();
    const colunasPorPai = new Array(pais.length).fill(0); // Contador de colunas por pai
    const filho: string[][] = [[], [], []]; // Matriz 3x5 vazia

    for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
      // Resetar estruturas de controle para esta tentativa
      numerosUsados.clear();
      colunasPorPai.fill(0);
      let sucesso = true;

      // Para cada coluna do filho (0 a 4)
      for (let colunaIndex = 0; colunaIndex < 5; colunaIndex++) {
        const colunasDisponiveis: Coluna[] = [];

        // Coletar colunas válidas de todos os pais
        pais.forEach((pai, paiIndex) => {
          // Se o pai já contribuiu com o máximo de colunas, pular
          if (colunasPorPai[paiIndex] >= MAX_COLUNAS_POR_PAI) {
            return;
          }

          // Verificar cada coluna deste pai
          for (let c = 0; c < 5; c++) {
            const coluna = extrairColuna(pai, c);
            // Verificar se a coluna não contém números já usados e não está vazia
            const colunaValida = coluna.every(num => 
              num.trim() !== "" && !numerosUsados.has(num)
            );

            if (colunaValida) {
              colunasDisponiveis.push({
                paiIndex,
                colunaIndex: c,
                numeros: coluna
              });
            }
          }
        });

        // Se não houver colunas disponíveis, esta tentativa falhou
        if (colunasDisponiveis.length === 0) {
          sucesso = false;
          break;
        }

        // Escolher uma coluna aleatoriamente
        const randomIndex = Math.floor(Math.random() * colunasDisponiveis.length);
        const colunaEscolhida = colunasDisponiveis[randomIndex];

        // Adicionar a coluna ao filho
        filho[0][colunaIndex] = colunaEscolhida.numeros[0];
        filho[1][colunaIndex] = colunaEscolhida.numeros[1];
        filho[2][colunaIndex] = colunaEscolhida.numeros[2];

        // Atualizar estruturas de controle
        colunaEscolhida.numeros.forEach(num => numerosUsados.add(num));
        colunasPorPai[colunaEscolhida.paiIndex]++;
      }

      // Se conseguimos preencher todas as colunas, retornar o filho
      if (sucesso) {
        return filho;
      }
    }

    // Se falhou após todas as tentativas, retornar null
    return null;
  }, [pais, extrairColuna]);

  // Função para ordenar cada linha do jogo
  const ordenarLinhasJogo = useCallback((matriz: string[][]): string[][] => {
    return matriz.map(linha => {
      // Converter para números, ordenar e converter de volta para string
      return linha
        .map(num => parseInt(num, 10))
        .sort((a, b) => a - b)
        .map(num => num.toString().padStart(2, '0'));
    });
  }, []);

  // Gerar jogos filhos
  const gerarFilhos = useCallback(() => {
    setErro("");
    const validacao = validarPais();
    
    if (validacao.error) {
      setErro(validacao.error);
      return;
    }
    
    const novosFilhos: Jogo[] = [];
    const maxTentativas = 1000;
    const jogosGerados = new Set<string>(); // Para evitar jogos duplicados

    for (let i = 0; i < numFilhos; i++) {
      let tentativas = 0;
      let jogoUnico = false;
      
      while (tentativas < maxTentativas && !jogoUnico) {
        const filhoMatriz = gerarFilhoPorColunas(maxTentativas);
        
        if (filhoMatriz) {
          // Ordenar cada linha do jogo filho
          const matrizOrdenada = ordenarLinhasJogo(filhoMatriz);
          
          // Gerar uma chave única para verificar duplicatas
          const chave = matrizOrdenada.flat().join('-');
          
          if (!jogosGerados.has(chave)) {
            jogosGerados.add(chave);
            novosFilhos.push({
              id: i + 1,
              matriz: matrizOrdenada
            });
            jogoUnico = true;
          }
        }
        tentativas++;
      }
      
      // Se não conseguiu gerar um jogo único após as tentativas
      if (!jogoUnico) {
        if (DEBUG) console.warn(`Não foi possível gerar um jogo único para o filho ${i+1} após ${maxTentativas} tentativas`);
      }
    }

    setFilhos(novosFilhos);
  }, [validarPais, gerarFilhoPorColunas, ordenarLinhasJogo, numFilhos]);

  // Copiar jogo
  const copiarJogo = useCallback((matriz: string[][], id: number) => {
    const texto = matriz.map(linha => linha.join("\t")).join("\n");
    navigator.clipboard.writeText(texto)
      .then(() => {
        setJogoCopiado(id);
        setTimeout(() => setJogoCopiado(null), 2000);
      });
  }, []);

  // Copiar todos os jogos no formato especificado
  const copiarTodosJogos = useCallback(() => {
    if (filhos.length === 0) return;
    
    const texto = filhos.map((jogo, index) => {
      return `${index + 1}º Jogo:\n${jogo.matriz.map(linha => linha.join(' ')).join('\n')}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(texto)
      .then(() => {
        setTodosCopiados(true);
        setTimeout(() => setTodosCopiados(false), 2000);
      });
  }, [filhos]);

  // Atualizar número no pai
  const atualizarNumero = useCallback((
    paiIndex: number, 
    linhaIndex: number, 
    colIndex: number, 
    valor: string
  ) => {
    const novosPais = [...pais];
    novosPais[paiIndex][linhaIndex][colIndex] = valor;
    setPais(novosPais);
  }, [pais]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10" />

          {/* Modal principal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-indigo-500/30 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
          >
            {/* Efeitos visuais */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
            
            {/* Header */}
            <div className="relative z-10 p-6 pt-8 pb-4 border-b border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-xl">
                    <FaDna className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Criador de Jogos Genético
                    </span>
                  </h2>
                </div>
                
                <button
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
                  onClick={onClose}
                  aria-label="Fechar modal"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-indigo-300">
                <FaRandom className="text-green-400" />
                <span>
                  Gere novos jogos combinando seus palpites
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar p-4">
              {/* Seção de Pais */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Jogos Pais</h3>
                <div className="text-sm text-emerald-300 mb-3">
                  Cada jogo pai deve ter exatamente 15 números únicos
                </div>
                {erro && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200">
                    {erro}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pais.map((pai, paiIndex) => (
                    <div 
                      key={paiIndex} 
                      className="bg-gray-800/50 border border-indigo-500/20 rounded-xl p-4"
                    >
                      <h4 className="text-lg font-semibold text-emerald-300 mb-3">
                        Pai {paiIndex + 1}
                      </h4>
                      
                      <div className="space-y-2">
                        {pai.map((linha, linhaIndex) => (
                          <div key={linhaIndex} className="flex gap-2">
                            {linha.map((numero, colIndex) => {
                              const numValido = numero.trim() !== "" && !numerosForaConjunto.includes(numero);
                              const numForaConjunto = numero.trim() !== "" && numerosForaConjunto.includes(numero);
                              
                              return (
                                <input
                                  key={colIndex}
                                  type="text"
                                  value={numero}
                                  onChange={(e) => 
                                    atualizarNumero(paiIndex, linhaIndex, colIndex, e.target.value)
                                  }
                                  className={`w-full max-w-[50px] text-center rounded-lg py-1 px-2 focus:outline-none focus:ring-1 ${
                                    numForaConjunto
                                      ? 'bg-red-900/50 border border-red-500 text-red-200 focus:ring-red-500'
                                      : numValido
                                      ? 'bg-gray-700 border border-indigo-500/30 text-white focus:ring-emerald-500'
                                      : 'bg-gray-700 border border-indigo-500/30 text-white focus:ring-emerald-500'
                                  }`}
                                  placeholder="00"
                                  maxLength={2}
                                  inputMode="numeric"
                                  pattern="\d{2}"
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Controle de Geração */}
              <div className="bg-gray-800/50 border border-indigo-500/20 rounded-xl p-4 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <label className="block text-emerald-300 mb-2">
                      Quantidade de Filhos
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={numFilhos}
                        onChange={(e) => setNumFilhos(parseInt(e.target.value))}
                        className="w-full max-w-[200px] accent-emerald-500"
                      />
                      <span className="bg-emerald-900/50 px-3 py-1 rounded-lg text-white font-bold">
                        {numFilhos}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={gerarFilhos}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all shadow-lg shadow-emerald-500/20 font-medium flex items-center gap-2"
                  >
                    <FaDna className="text-white" />
                    <span>Gerar Jogos Filhos</span>
                  </button>
                </div>
              </div>
              
              {/* Resultados */}
              {filhos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Jogos Gerados ({filhos.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copiarTodosJogos}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg shadow-indigo-500/20 font-medium flex items-center gap-2"
                      >
                        <FaClipboardList />
                        <span>Copiar Todos</span>
                      </button>
                      {todosCopiados && (
                        <div className="flex items-center px-3 bg-emerald-700/30 border border-emerald-500/50 rounded-lg text-emerald-300">
                          <FaCheck className="mr-1" /> Copiado!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filhos.map((jogo) => (
                      <motion.div
                        key={jogo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-indigo-500/20 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer relative"
                        onClick={() => copiarJogo(jogo.matriz, jogo.id)}
                      >
                        {jogoCopiado === jogo.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-sm rounded-xl"></div>
                            <div className="relative z-30 flex flex-col items-center p-4 bg-gradient-to-b from-emerald-800 to-emerald-900 border-2 border-emerald-500/80 rounded-2xl shadow-xl shadow-emerald-500/30">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-700/50 border-2 border-emerald-400 mb-3">
                                <FaCheck className="text-emerald-300 text-xl" />
                              </div>
                              <span className="text-emerald-100 font-bold text-lg text-center">
                                COPIADO!
                              </span>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <FaDna className="text-emerald-400" />
                            <span className="font-bold">Jogo {jogo.id}</span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            Clique para copiar
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {jogo.matriz.map((linha, linhaIndex) => (
                            <div key={linhaIndex} className="flex gap-2 justify-center">
                              {linha.map((numero, numIndex) => (
                                <div
                                  key={numIndex}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border border-emerald-500/30 font-bold text-white text-sm"
                                >
                                  {numero}
                                </div>
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

            {/* Footer */}
            <div className="relative z-10 p-4 border-t border-indigo-500/20 bg-gray-900/50">
              <div className="flex justify-center">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg shadow-indigo-500/20 font-medium"
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

// Constante para debug (não utilizada no componente, mas mantida para referência)
const DEBUG = true;