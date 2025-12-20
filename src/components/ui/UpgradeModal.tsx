// src/components/UpgradeModal.tsx
import React from 'react';
import { GeneratorType } from '@/types/generator';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  targetPlan: GeneratorType | null;
}

const planNames = {
  free: 'Gratuito',
  basic: 'Básico',
  plus: 'Plus',
  premium: 'Premium',
};

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgrade,
  targetPlan
}: UpgradeModalProps) {
  if (!isOpen || !targetPlan) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-yellow-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-5V9a3 3 0 00-6 0v1M5 10h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Upgrade Necessário
            </h3>
            <p className="text-gray-300">
              Para acessar o gerador <span className="text-yellow-400 font-bold">{planNames[targetPlan]}</span>, você precisa de uma assinatura superior.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="font-bold text-gray-200 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Recursos do plano {planNames[targetPlan]}
            </h4>
            <p className="text-gray-400 text-sm">
              {targetPlan === 'basic' && 'Acesso a análises básicas e histórico completo'}
              {targetPlan === 'plus' && 'Números fixos e exclusões, geração em lote'}
              {targetPlan === 'premium' && 'Estratégias avançadas e inteligência artificial'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onUpgrade}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl text-white font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
            >
              Fazer Upgrade Agora
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 transition-all"
            >
              Talvez mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}