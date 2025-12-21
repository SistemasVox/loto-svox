/* =============================================================================
 * ARQUIVO: src/components/gerador/ProgressBar.tsx
 * DESCRIÇÃO: Barra técnica com Interpolação Linear e Visual Segmentado.
 * ============================================================================= */

import React, { useState, useEffect } from 'react';

export default function ProgressBar({ progress }: { progress: number }) {
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    // Se o progresso for 0, resetamos o estado visual
    if (progress === 0) {
      setVisualProgress(0);
      return;
    }

    // INTERPOLAÇÃO DINÂMICA: Move o visual de 0 a 100 em 3 segundos
    const duration = 3000; 
    const steps = 100;
    const increment = progress / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setVisualProgress((prev) => {
        const next = prev + increment;
        if (next >= progress) {
          clearInterval(timer);
          return progress;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [progress]);

  return (
    <div className="w-full mt-8 mb-6 bg-[#050505] p-1.5 rounded-xl border border-slate-800/80 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER TÉCNICO SINCRONIZADO */}
      <div className="flex justify-between items-center mb-2 px-4 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">
            PROCESSANDO_LOTE_INTELIGENTE
          </span>
        </div>
        <span className="text-[13px] font-black text-white italic tracking-tighter">
          {Math.floor(visualProgress)}%
        </span>
      </div>

      {/* TRACK (LARGURA TOTAL) */}
      <div className="w-full bg-black h-8 relative overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)] border border-slate-900">
        
        {/* BARRA DE PREENCHIMENTO (NEON + MÁSCARA SEGMENTADA) */}
        <div 
          className="h-full relative"
          style={{ 
            width: `${visualProgress}%`, // Sincronia absoluta com o número
            background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
          }}
        >
          {/* MÁSCARA DE SEGMENTAÇÃO (Ref: image_cfc280.png) */}
          <div className="absolute inset-0 w-full h-full opacity-40"
               style={{
                 backgroundImage: 'linear-gradient(90deg, #000 2px, transparent 2px)',
                 backgroundSize: '8px 100%'
               }} 
          />
          
          {/* EFEITO SCANLINE */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full animate-slow-scan" 
               style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes slow-scan {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-slow-scan {
          animation: slow-scan 10s infinite linear;
        }
      `}</style>
    </div>
  );
}