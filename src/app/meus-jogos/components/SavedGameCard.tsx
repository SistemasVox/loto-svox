// src/app/minha-conta/meus-jogos/components/SavedGameCard.tsx

// ======================================================================
// IMPORTS
// ======================================================================
import React, { useState, useEffect } from 'react'
import { FaTrash, FaCalendar, FaCoins, FaHistory, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// ======================================================================
// INTERFACES E TIPOS
// ======================================================================
interface SavedGameCardProps {
  game: {
    id: number;
    numbers: number[];
    createdAt: string;
    valorTotal?: number;
    valorTotalHistorico?: number;
  };
  onDelete: (id: number) => void;
  onHover: () => void;
}

// ======================================================================
// COMPONENTE PRINCIPAL
// ======================================================================
export default function SavedGameCard({
  game,
  onDelete,
  onHover
}: SavedGameCardProps) {
  const [copied, setCopied] = useState(false);
  
  // --------------------------------------------------------------------
  // Formata a data do jogo salvo com verificação de segurança
  // --------------------------------------------------------------------
  const formattedDate = game?.createdAt 
    ? new Date(game.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Data inválida';

  // Função para copiar o jogo para a área de transferência no formato 3x5
  const copyToClipboard = () => {
    // Formata os números com dois dígitos
    const formattedNumbers = game.numbers.map(num => num.toString().padStart(2, '0'));
    
    // Divide em três linhas de 5 números
    const lines = [];
    for (let i = 0; i < 3; i++) {
      const line = formattedNumbers.slice(i * 5, (i + 1) * 5).join(' ');
      lines.push(line);
    }
    
    // Junta as linhas com quebra de linha
    const textToCopy = lines.join('\n');
    
    // Copia para a área de transferência
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
      });
  };

  // Efeito para resetar o estado de cópia após 2 segundos
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // ====================================================================
  // RENDERIZAÇÃO DO CARD
  // ====================================================================
  return (
    <motion.div
      // Animação ao passar mouse (escala e sombra)
      whileHover={{ scale: 1.03, boxShadow: '0 4px 24px #3b82f6' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      // Classe Tailwind padrão + foco para acessibilidade
      className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden transition-transform group focus-within:ring-2 focus-within:ring-cyan-400 outline-none relative"
      tabIndex={0}
      onFocus={onHover}
      onMouseEnter={onHover}
      onClick={copyToClipboard} // Adiciona o evento de clique para copiar
    >
      {/* Overlay de feedback de cópia */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10"
          >
            <div className="text-center p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-2"
              >
                <FaCheck className="text-green-300 text-4xl" />
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-green-200 font-bold text-xl"
              >
                JOGO COPIADO!
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-green-300 text-sm mt-1"
              >
                Formato: Matriz 3×5
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho do card */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          {/* Data */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaCalendar />
            <span>{formattedDate}</span>
          </div>

          {/* Botão de excluir */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Impede que o evento de clique do card seja acionado
              onDelete(game.id);
            }}
            className={`p-2 rounded-lg transition-all outline-none
              text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:ring-2 focus:ring-red-400 z-20`} // Aumenta o z-index para ficar acima do overlay
            onMouseEnter={onHover}
            title="Excluir jogo"
            tabIndex={0}
            aria-label="Excluir jogo salvo"
          >
            <FaTrash />
          </button>
        </div>

        {/* Números do jogo */}
        <div className="grid grid-cols-5 gap-2">
          {game?.numbers?.map((num: number, idx: number) => (
            <div
              key={idx}
              className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm"
            >
              {num.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé do card - agora com mais informações */}
      <div className="bg-gray-800/50 px-5 py-3 border-t border-gray-700 space-y-2">
        {/* Valor acumulado desde a criação */}
        {game?.valorTotal !== undefined && (
          <div 
            className="flex items-center gap-2 text-xs"
            title="Valor acumulado desde o concurso de origem"
          >
            <FaCoins className="text-yellow-500 flex-shrink-0" />
            <span className="text-gray-300">Desde criação:</span>
            <span className="text-yellow-400 font-bold">
              R$ {game.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Novo: Valor acumulado em toda a história */}
        {game?.valorTotalHistorico !== undefined && (
          <div 
            className="flex items-center gap-2 text-xs"
            title="Valor acumulado se apostado em todos os concursos da história"
          >
            <FaHistory className="text-cyan-400 flex-shrink-0" />
            <span className="text-gray-300">Histórico total:</span>
            <span className="text-cyan-300 font-bold">
              R$ {game.valorTotalHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* ID do Jogo - movido para o final se ambos os valores existirem */}
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-700/50">
          ID: {game?.id || 'N/A'}
        </div>
      </div>
    </motion.div>
  )
}