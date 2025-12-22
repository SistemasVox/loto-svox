/* =============================================================================
 * ARQUIVO: src/components/gerador/GeradorHeader.tsx
 * VERSÃO: 3.0.0 (Space Impact Retro Background)
 * DESCRIÇÃO: Cabeçalho com fundo animado simulando batalha espacial retro.
 * ============================================================================= */

import React from 'react';
import { getLevelDisplayName } from '@/utils/displayHelpers';

interface GeradorHeaderProps {
  isSpecialBrowser: boolean;
  user: any;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  historicos: any[];
  savedGamesRemaining: number | null;
}

export default function GeradorHeader({ 
  isSpecialBrowser, 
  user, 
  subscriptionPlan, 
  historicos, 
  savedGamesRemaining 
}: GeradorHeaderProps) {
  return (
    <div className="mb-12 animate-slide-in bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
      
      {/* CAMADA DE FUNDO: SPACE IMPACT SIMULATOR */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        {/* Estrelas ao fundo (Starfield) */}
        <div className="stars-layer" />
        
        {/* Nave Jogador (Pixel Ship) */}
        <div className="pixel-ship" />
        
        {/* Inimigos e Lasers */}
        <div className="pixel-enemy enemy-1" />
        <div className="pixel-enemy enemy-2" />
        <div className="laser-beam laser-1" />
        <div className="laser-beam laser-2" />
      </div>

      <div className="text-center relative z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative px-8 py-4" style={isSpecialBrowser ? titleStyleOpera : titleStyle}>
          <span className="relative z-10">Gerador Inteligente</span>
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-green-500/20 blur-2xl -z-10 scale-110" />
        </h1>

        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed" style={subtitleStyle}>
          Gere combinações estratégicas para a Lotofácil usando inteligência artificial
          e análise de dados históricos avançada
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {user && (
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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

          {user && savedGamesRemaining !== null && (
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm text-gray-300 font-mono">
                Jogos salvos: {savedGamesRemaining} restantes
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      </div>

      {/* ESTILOS TÉCNICOS PARA A BATALHA ESPACIAL */}
      <style jsx>{`
        .stars-layer {
          position: absolute;
          width: 200%;
          height: 100%;
          background: radial-gradient(1px 1px at 10px 10px, #fff, transparent),
                      radial-gradient(1.5px 1.5px at 100px 30px, #fff, transparent),
                      radial-gradient(1px 1px at 200px 80px, #fff, transparent);
          background-size: 300px 300px;
          animation: scrollStars 20s linear infinite;
        }

        .pixel-ship {
          position: absolute;
          left: 5%;
          top: 50%;
          width: 24px;
          height: 14px;
          background-color: #3b82f6;
          clip-path: polygon(0 0, 70% 30%, 100% 50%, 70% 70%, 0 100%, 20% 50%);
          animation: shipMove 4s ease-in-out infinite;
          box-shadow: -10px 0 15px rgba(59, 130, 246, 0.5);
        }

        .pixel-enemy {
          position: absolute;
          width: 18px;
          height: 18px;
          background-color: #ef4444;
          clip-path: polygon(100% 0, 30% 30%, 0 50%, 30% 70%, 100% 100%, 80% 50%);
        }

        .enemy-1 { top: 20%; right: -50px; animation: enemyCruise 8s linear infinite; }
        .enemy-2 { top: 70%; right: -50px; animation: enemyCruise 12s linear infinite 2s; }

        .laser-beam {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, #60a5fa, transparent);
          width: 40px;
        }

        .laser-1 { left: 10%; top: 52%; animation: laserShot 2s linear infinite; }

        @keyframes scrollStars {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes shipMove {
          0%, 100% { transform: translateY(-20px) rotate(2deg); }
          50% { transform: translateY(20px) rotate(-2deg); }
        }

        @keyframes enemyCruise {
          from { right: -50px; }
          to { right: 110%; }
        }

        @keyframes laserShot {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(1000px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Estilos de texto (mantidos conforme original)
const titleStyle: React.CSSProperties = { fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #22c55e 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const titleStyleOpera: React.CSSProperties = { fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff', textShadow: '0 0 20px rgba(14, 165, 233, 0.8)' };
const subtitleStyle: React.CSSProperties = { fontWeight: 400, lineHeight: 1.6 };