// =============================================================================
// ARQUIVO: src/components/gerador/GeradorHeader.tsx
// DESCRIÇÃO: Componente de cabeçalho da página do Gerador Inteligente.
//            Exibe o título, subtítulo e indicadores de status do usuário.
// =============================================================================

import React from 'react';
import { getLevelDisplayName } from '@/utils/displayHelpers';

// =============================================================================
// INTERFACES
// =============================================================================
interface GeradorHeaderProps {
  isSpecialBrowser: boolean;
  user: any;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  historicos: any[];
  savedGamesRemaining: number;
}

// =============================================================================
// COMPONENTE
// =============================================================================
export default function GeradorHeader({ isSpecialBrowser, user, subscriptionPlan, historicos, savedGamesRemaining }: GeradorHeaderProps) {
  return (
    <div className="mb-12 animate-slide-in bg-gray-900/90 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative px-8 py-4" style={isSpecialBrowser ? titleStyleOpera : titleStyle}>
          <span className="relative z-10">Gerador Inteligente</span>
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-green-500/20 blur-2xl -z-10 scale-110" />
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 via-cyan-400/15 to-green-400/10 blur-xl -z-10" />
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-300/5 via-cyan-300/8 to-green-300/5 blur-lg -z-10" />
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed" style={subtitleStyle}>
          Gere combinações estratégicas para a Lotofácil usando inteligência artificial
          e análise de dados históricos avançada
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {user && (
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-300 font-mono">
                {user.name || user.email} • {getLevelDisplayName(subscriptionPlan)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${historicos.length > 0 ? 'bg-blue-400' : 'bg-orange-400'}`} />
            <span className="text-sm text-gray-300 font-mono">
              {historicos.length > 0 ? `${historicos.length} concursos carregados` : 'Carregando dados...'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-gray-300 font-mono">
              Jogos salvos: {savedGamesRemaining} restantes
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      </div>
    </div>
  );
}

// =============================================================================
// ESTILOS INLINE
// =============================================================================
const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #22c55e 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: 'none',
    margin: '0 auto',
    display: 'inline-block',
    position: 'relative',
};
  
const titleStyleOpera: React.CSSProperties = {
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#ffffff',
    textShadow: `
      0 0 20px rgba(14, 165, 233, 0.8),
      0 0 40px rgba(34, 197, 94, 0.6),
      0 0 60px rgba(14, 165, 233, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.3)
    `,
    margin: '0 auto',
    display: 'inline-block',
    position: 'relative',
};
  
const subtitleStyle: React.CSSProperties = {
    fontWeight: 400,
    lineHeight: 1.6,
};