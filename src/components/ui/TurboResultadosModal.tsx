/* =============================================================================
 * ARQUIVO: src/components/ui/TurboResultadosModal.tsx
 * DESCRIÇÃO: Modal para exibir os melhores jogos sugeridos pela análise premium (Turbo)
 * ============================================================================= */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCrown, FaMedal, FaTrophy, FaMoneyBillWave, FaChartLine, FaCheck, FaDna } from "react-icons/fa";
import { IoMdStar, IoMdTrendingUp } from "react-icons/io";
import CriadorJogosModal from "./CriadorJogosModal"; // Importar o novo modal

interface JogoRentavel {
  rank: number;
  dezenas: string[];
  acertos: { [qtd: string]: number };
  premio_total: number;
}

interface ConcursoAnalisado {
  concurso: number;
  data_concurso: string;
  dezenas: string;
}

interface TurboResultadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultados: {
    melhoresJogos: JogoRentavel[];
    periodoAnalisado: ConcursoAnalisado[];
  } | null;
}

const premioFormatado = (valor: number) =>
  valor >= 1000000
    ? `R$ ${(valor / 1000000).toFixed(1)} mi`
    : valor >= 1000
    ? `R$ ${(valor / 1000).toFixed(1)} mil`
    : `R$ ${valor.toFixed(2)}`;

export default function TurboResultadosModal({
  isOpen,
  onClose,
  resultados,
}: TurboResultadosModalProps) {
  // Estado para controle do feedback de cópia
  const [jogoCopiado, setJogoCopiado] = useState<number | null>(null);
  
  // Estados para controlar o modal de criação de jogos
  const [criadorAberto, setCriadorAberto] = useState(false);
  const [paisIniciais, setPaisIniciais] = useState<string[][][] | null>(null);

  // Impedir scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Resetar o estado de cópia quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setJogoCopiado(null);
    }
  }, [isOpen]);

  // Função para copiar as dezenas do jogo para a área de transferência no formato de matriz 3x5
  const copiarJogo = (dezenas: string[], rank: number) => {
    // Formatar como matriz 3x5
    const linhas = [];
    for (let i = 0; i < 3; i++) {
      const linha = dezenas.slice(i * 5, (i + 1) * 5).join("\t");
      linhas.push(linha);
    }
    const textoCopiado = linhas.join("\n");

    navigator.clipboard.writeText(textoCopiado)
      .then(() => {
        setJogoCopiado(rank);
        // Remove o feedback após 2 segundos
        setTimeout(() => setJogoCopiado(null), 2000);
      })
      .catch(err => {
        console.error('Falha ao copiar: ', err);
      });
  };

  // Abrir o criador de jogos com os 3 primeiros jogos como pais
  const abrirCriadorAutomatico = () => {
    if (!resultados || resultados.melhoresJogos.length < 3) return;
    
    const tresMelhores = resultados.melhoresJogos.slice(0, 3);
    
    // Formatar cada jogo como matriz 3x5
    const paisFormatados = tresMelhores.map(jogo => {
      const dezenas = jogo.dezenas;
      return [
        dezenas.slice(0, 5),
        dezenas.slice(5, 10),
        dezenas.slice(10, 15)
      ];
    });
    
    setPaisIniciais(paisFormatados);
    setCriadorAberto(true);
  };

  // Abrir o criador de jogos com campos vazios
  const abrirCriadorManual = () => {
    setPaisIniciais(null);
    setCriadorAberto(true);
  };

  if (!isOpen || !resultados) return null;

  // Ordenar os jogos pelo rank
  const jogosOrdenados = resultados.melhoresJogos;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop com efeito de brilho */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10" />

          {/* Modal principal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-indigo-500/30 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
          >
            {/* Efeitos visuais */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
            
            {/* Header */}
            <div className="relative z-10 p-6 pt-8 pb-4 border-b border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-xl">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Análise Premium
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
                <IoMdTrendingUp className="text-indigo-400" />
                <span>
                  Baseado nos últimos <b className="text-white">{resultados.periodoAnalisado.length}</b> concursos
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {jogosOrdenados.map((j) => (
                  <motion.div
                    key={j.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: j.rank * 0.05 }}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-indigo-500/20 rounded-xl p-4 hover:border-indigo-500/50 transition-all group cursor-pointer relative"
                    onClick={() => copiarJogo(j.dezenas, j.rank)}
                  >
                    {/* Feedback de cópia - Melhorado com sombras, bordas e destaque */}
                    {jogoCopiado === j.rank && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-20"
                      >
                        <div className="absolute inset-0 bg-green-900/80 backdrop-blur-sm rounded-xl"></div>
                        <div className="relative z-30 flex flex-col items-center p-6 bg-gradient-to-b from-green-800 to-green-900 border-2 border-green-500/80 rounded-2xl shadow-xl shadow-green-500/30">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-700/50 border-2 border-green-400 mb-4">
                            <FaCheck className="text-green-300 text-3xl" />
                          </div>
                          <span className="text-green-100 font-bold text-xl text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            JOGO COPIADO!
                          </span>
                          <span className="text-green-300 text-sm text-center mt-2 font-medium">
                            Formato: Matriz 3×5
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {j.rank === 1 ? (
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-1 rounded-md">
                            <FaCrown className="text-yellow-100" />
                          </div>
                        ) : j.rank <= 3 ? (
                          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-1 rounded-md">
                            <FaMedal className="text-amber-100" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-md">
                            <IoMdStar className="text-blue-100" />
                          </div>
                        )}
                        <span className="font-bold text-lg text-white">
                          #{j.rank}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-indigo-900/50 px-2 py-1 rounded-full">
                        <FaMoneyBillWave className="text-indigo-300 text-sm" />
                        <span className={`font-bold text-sm ${
                          j.premio_total > 0 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          {premioFormatado(j.premio_total)}
                        </span>
                      </div>
                    </div>

                    {/* Números */}
                    <div className="grid grid-cols-5 gap-1.5 mb-4">
                      {j.dezenas.map((d, idx) => (
                        <motion.div
                          key={`${j.rank}-${d}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`
                            flex items-center justify-center h-10 rounded-lg
                            bg-gradient-to-br from-gray-700 to-gray-800
                            border border-indigo-500/30
                            group-hover:border-indigo-400/50
                            shadow-[0_0_8px_rgba(99,102,241,0.1)]
                            group-hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]
                            transition-all
                          `}
                        >
                          <span className="font-bold text-white text-sm">
                            {d}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Estatísticas de acertos */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="grid grid-cols-5 gap-2">
                        {[11, 12, 13, 14, 15].map((qtd) => (
                          <div 
                            key={qtd} 
                            className="flex flex-col items-center"
                          >
                            <div className="text-xs text-gray-400 mb-1">
                              {qtd} acertos
                            </div>
                            <div className="bg-gray-800/50 w-full h-1 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${Math.min(100, (j.acertos[qtd] || 0) * 25)}%` 
                                }}
                                transition={{ 
                                  duration: 0.8, 
                                  delay: 0.2,
                                  ease: "easeOut" 
                                }}
                              />
                            </div>
                            <div className="mt-1 font-bold text-white">
                              {j.acertos[qtd] || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 p-4 border-t border-indigo-500/20 bg-gray-900/50">
              <div className="flex flex-wrap justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all shadow-lg shadow-emerald-500/20 font-medium flex items-center gap-2"
                  onClick={abrirCriadorAutomatico}
                >
                  <FaDna className="text-white" />
                  <span>Gerar Filhos Automático</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all shadow-lg shadow-amber-500/20 font-medium flex items-center gap-2"
                  onClick={abrirCriadorManual}
                >
                  <FaDna className="text-white" />
                  <span>Gerar Filhos Manual</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg shadow-indigo-500/20 font-medium flex items-center gap-2"
                  onClick={onClose}
                >
                  <FaTrophy className="text-yellow-300" />
                  <span>Fechar Resultados</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Modal do Criador de Jogos Genético */}
      <CriadorJogosModal
        isOpen={criadorAberto}
        onClose={() => setCriadorAberto(false)}
        paisIniciais={paisIniciais}
      />
    </>
  );
}

/* ########################### FIM DO ARQUIVO ########################### */