// src/components/gerador/NumberSelectionTables.tsx
import React from 'react';
import { GeneratorType } from '@/types/generator';

interface NumberSelectionTablesProps {
  activeTab: GeneratorType;
  numerosFixos: number[];  // Alterado de fixedNumbers para numerosFixos
  numerosExcluidos: number[];  // Alterado de excludedNumbers para numerosExcluidos
  onFixedNumbersChange: (numbers: number[]) => void;
  onExcludedNumbersChange: (numbers: number[]) => void;
  onHover?: () => void;
}

export default function NumberSelectionTables({
  activeTab,
  numerosFixos,  // Alterado
  numerosExcluidos,  // Alterado
  onFixedNumbersChange,
  onExcludedNumbersChange,
  onHover
}: NumberSelectionTablesProps) {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  
  const toggleFixedNumber = (number: number) => {
    if (numerosFixos.includes(number)) {  // Alterado
      onFixedNumbersChange(numerosFixos.filter(n => n !== number));  // Alterado
    } else {
      onFixedNumbersChange([...numerosFixos, number]);  // Alterado
    }
  };

  const toggleExcludedNumber = (number: number) => {
    if (numerosExcluidos.includes(number)) {  // Alterado
      onExcludedNumbersChange(numerosExcluidos.filter(n => n !== number));  // Alterado
    } else {
      onExcludedNumbersChange([...numerosExcluidos, number]);  // Alterado
    }
  };

  const clearFixed = () => onFixedNumbersChange([]);
  const clearExcluded = () => onExcludedNumbersChange([]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-slide-in">
      {/* Tabela de Números Fixos */}
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Números Fixos
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              Selecione os números que devem aparecer em todos os jogos gerados
            </p>
          </div>
          <button
            onClick={clearFixed}
            onMouseEnter={onHover}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Limpar
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-3 mb-4">
          {numbers.map(number => (
            <button
              key={`fixed-${number}`}
              onClick={() => toggleFixedNumber(number)}
              onMouseEnter={onHover}
              className={`
                w-12 h-12 rounded-lg font-bold text-sm transition-all duration-200 border-2
                ${numerosFixos.includes(number)  // Alterado
                  ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30 scale-105'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-gray-500'
                }
              `}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {number.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span style={{ fontFamily: "'Inter', sans-serif" }}>
            Selecionados: {numerosFixos.length} números  {/* Alterado */}
          </span>
        </div>
      </div>

      {/* Tabela de Números Excluídos */}
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-600/30 rounded-2xl p-6 shadow-2xl relative">
        {/* Overlay de bloqueio para plano Plus */}
        {activeTab === 'plus' && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Recurso Premium
              </h4>
              <p className="text-gray-300 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                Exclusão de números disponível apenas no plano Premium
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Números Excluídos
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              Selecione os números que devem ser evitados em todos os jogos
            </p>
          </div>
          <button
            onClick={clearExcluded}
            onMouseEnter={onHover}
            disabled={activeTab === 'plus'}
            className={`
              px-4 py-2 text-white rounded-lg transition-all duration-200 text-sm font-medium
              ${activeTab === 'plus' 
                ? 'bg-gray-600/50 cursor-not-allowed opacity-50' 
                : 'bg-red-600/80 hover:bg-red-600'
              }
            `}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Limpar
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-3 mb-4">
          {numbers.map(number => (
            <button
              key={`excluded-${number}`}
              onClick={() => activeTab === 'premium' && toggleExcludedNumber(number)}
              onMouseEnter={onHover}
              disabled={activeTab === 'plus'}
              className={`
                w-12 h-12 rounded-lg font-bold text-sm transition-all duration-200 border-2
                ${activeTab === 'plus'
                  ? 'bg-gray-700/30 border-gray-600/50 text-gray-500 cursor-not-allowed'
                  : numerosExcluidos.includes(number)  // Alterado
                    ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-gray-500'
                }
              `}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {number.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className={`w-3 h-3 rounded ${activeTab === 'plus' ? 'bg-gray-500' : 'bg-red-500'}`} />
          <span style={{ fontFamily: "'Inter', sans-serif" }}>
            Excluídos: {numerosExcluidos.length} números  {/* Alterado */}
          </span>
        </div>
      </div>
    </div>
  );
}