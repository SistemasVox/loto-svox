// =============================================================================
// ARQUIVO: src/components/gerador/RestrictedAccessView.tsx
// DESCRIÇÃO: Componente que renderiza a tela de bloqueio para usuários não
//            logados que tentam acessar recursos pagos.
// =============================================================================

import React from 'react';
import { useRouter } from 'next/navigation';
import { GeneratorType } from '@/types/generator';

// =============================================================================
// INTERFACES
// =============================================================================
interface RestrictedAccessViewProps {
  activeTab: GeneratorType;
  playHoverSound: () => void;
}

// =============================================================================
// COMPONENTE
// =============================================================================
export default function RestrictedAccessView({ activeTab, playHoverSound }: RestrictedAccessViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="text-center p-8 max-w-md mx-4 bg-gray-900/90 backdrop-blur-md border border-gray-600/30 rounded-2xl">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-5V9a3 3 0 00-6 0v1M5 10h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Acesso Restrito</h2>
          <p className="text-gray-300 leading-relaxed">
            Você precisa estar logado para acessar o gerador {activeTab === 'plus' ? 'Plus' : 'Premium'}.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          style={accessButtonStyle}
          className="w-full transition-all duration-200"
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.4)';
            playHoverSound();
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,165,233,0.3)';
          }}
        >
          Fazer Login
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// ESTILOS INLINE
// =============================================================================
const accessButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
};