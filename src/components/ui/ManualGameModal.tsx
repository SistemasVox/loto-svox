/* =============================================================================
 * ARQUIVO: src/components/ui/ManualGameModal.tsx
 * DESCRIÇÃO: Modal para criação manual de jogos com seleção de 15 dezenas.
 *             Design moderno com animações fluidas usando Framer Motion.
 * ============================================================================= */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaSpinner, FaCheck, FaCircle } from 'react-icons/fa';
import { useSound } from 'use-sound';
import { twMerge } from 'tailwind-merge';

interface ManualGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (numbers: number[]) => Promise<boolean>;
  saving: boolean;
}

/* =============================================================================
 * CONSTANTES DE ANIMAÇÃO
 * ============================================================================= */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.3
    }
  }),
  selected: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.4 }
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.4)'
  }
};

/* =============================================================================
 * COMPONENTE: ManualGameModal
 * ============================================================================= */
const ManualGameModal: React.FC<ManualGameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  saving
}) => {
  /* ===========================================================================
   * STATE & EFFECTS
   * =========================================================================== */
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);
  const [playHover] = useSound('/sounds/beep-1.mp3', { volume: 0.5 });
  const [playSelect] = useSound('/sounds/select.mp3', { volume: 0.3 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.3 });
  
  // Resetar estado quando modal é aberto/fechado
  useEffect(() => {
    if (!isOpen) {
      setSelectedNumbers([]);
      setSuccess(false);
    }
  }, [isOpen]);

  /* ===========================================================================
   * HANDLERS
   * =========================================================================== */
  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else {
      if (selectedNumbers.length < 15) {
        setSelectedNumbers(prev => [...prev, number]);
        playSelect();
      }
    }
  };
  
  const handleSave = async () => {
    if (selectedNumbers.length !== 15) {
      alert('Selecione exatamente 15 números.');
      return;
    }
    
    const sortedNumbers = [...selectedNumbers].sort((a, b) => a - b);
    const saved = await onSave(sortedNumbers);
    
    if (saved) {
      playSuccess();
      setSuccess(true);
      setTimeout(() => {
        setSelectedNumbers([]);
        setSuccess(false);
      }, 1500);
    }
  };

  /* ===========================================================================
   * RENDERIZAÇÃO
   * =========================================================================== */
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ 
              scale: 1, 
              y: 0,
              borderColor: success ? '#10B981' : '#3B82F6',
              boxShadow: success 
                ? '0 0 30px rgba(16, 185, 129, 0.5)' 
                : '0 0 30px rgba(59, 130, 246, 0.3)'
            }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-gray-900 border-2 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-blue-500/20 bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={success ? {
                      rotate: 360,
                      scale: [1, 1.2, 1],
                      backgroundColor: ['#3B82F6', '#10B981']
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className="p-2 rounded-xl bg-blue-500"
                  >
                    {success ? (
                      <FaCheck className="text-white text-xl" />
                    ) : (
                      <FaSave className="text-white text-xl" />
                    )}
                  </motion.div>
                  <motion.h2 
                    animate={success ? { color: '#10B981' } : {}}
                    className="text-2xl font-bold text-white"
                  >
                    {success ? 'Jogo Salvo!' : 'Salvar Jogo Manual'}
                  </motion.h2>
                </div>
                <motion.button 
                  onClick={onClose}
                  onMouseEnter={playHover}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>
            </div>

            {/* Conteúdo */}
            <motion.div
              animate={{
                opacity: success ? 0.8 : 1,
                y: success ? 10 : 0
              }}
              className="p-6 bg-gradient-to-br from-gray-900 to-gray-800"
            >
              <p className="text-gray-300 mb-6 text-center">
                {success ? (
                  <motion.span 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-green-400 font-semibold text-lg"
                  >
                    Jogo salvo com sucesso!
                  </motion.span>
                ) : (
                  'Selecione 15 números (de 01 a 25):'
                )}
              </p>
              
              <motion.div 
                className="grid grid-cols-5 gap-3 mb-6"
                initial="hidden"
                animate="visible"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((number, index) => (
                  <motion.button
                    key={number}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate={selectedNumbers.includes(number) ? "selected" : "visible"}
                    whileHover={!success ? "hover" : {}}
                    onClick={() => !success && toggleNumber(number)}
                    className={twMerge(
                      "flex items-center justify-center h-14 w-14 rounded-xl text-lg font-bold transition-all relative overflow-hidden",
                      selectedNumbers.includes(number)
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                      success ? 'cursor-default' : 'cursor-pointer'
                    )}
                    disabled={success}
                  >
                    {selectedNumbers.includes(number) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 text-green-400"
                      >
                        <FaCircle size={12} />
                      </motion.span>
                    )}
                    {formatNumber(number)}
                  </motion.button>
                ))}
              </motion.div>
              
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{
                      width: `${(selectedNumbers.length / 15) * 100}%`,
                      backgroundColor: selectedNumbers.length === 15 
                        ? '#10B981' 
                        : '#3B82F6'
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className={twMerge(
                    "text-sm font-medium",
                    selectedNumbers.length === 15 
                      ? 'text-green-400' 
                      : 'text-blue-400'
                  )}>
                    {selectedNumbers.length} de 15 selecionados
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <div className="p-4 border-t border-blue-500/20 bg-gray-900/80 flex justify-center gap-4">
              <motion.button
                onClick={onClose}
                disabled={saving || success}
                whileHover={!saving && !success ? { scale: 1.05 } : {}}
                whileTap={!saving && !success ? { scale: 0.95 } : {}}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancelar
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                disabled={saving || success || selectedNumbers.length !== 15}
                whileHover={
                  !saving && !success && selectedNumbers.length === 15 
                    ? { scale: 1.05 } 
                    : {}
                }
                whileTap={
                  !saving && !success && selectedNumbers.length === 15 
                    ? { scale: 0.95 } 
                    : {}
                }
                className={twMerge(
                  "flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition-all",
                  selectedNumbers.length === 15 && !success
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    : 'bg-gray-600 cursor-not-allowed'
                )}
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <FaSpinner />
                  </motion.div>
                ) : success ? (
                  <FaCheck />
                ) : (
                  <FaSave />
                )}
                {saving ? 'Salvando...' : success ? 'Salvo!' : 'Salvar Jogo'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualGameModal;