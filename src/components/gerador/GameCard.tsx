/* =============================================================================
 * ARQUIVO: src/components/gerador/GameCard.tsx
 * VERSÃO: 3.5.0 (Etapa 3.3 - Versão Final e Íntegra)
 * DESCRIÇÃO: Card de jogo com funcionalidade de "Click-to-Copy" (3x5) e Salvar.
 * Redireciona visitantes para o login e preserva estética original.
 * ============================================================================= */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratedGame, GeneratorType } from '@/types/generator';
import { 
  FaDice, FaStar, FaGem, FaCrown, FaBookmark, 
  FaSpinner, FaCheck, FaLock 
} from 'react-icons/fa';

interface GameCardProps {
  game: GeneratedGame;
  type: GeneratorType;
  index: number;
  onSaveGame: (numbers: number[], gameId: number) => void;
  saving: boolean;
  savedGamesRemaining: number;
  isLoggedIn: boolean; // Prop de controle de sessão injetada pelo GamesList
}

export default function GameCard({
  game,
  type,
  index,
  onSaveGame,
  saving,
  savedGamesRemaining,
  isLoggedIn,
}: GameCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  /**
   * LÓGICA DE CÓPIA INTEGRAL (PADRÃO 3x5)
   * Ordena as dezenas e formata em 3 blocos de 5 números com preenchimento de zero.
   */
  const handleCopy = () => {
    const numbers = [...game.numbers].sort((a, b) => a - b); //
    
    const lines = [
      numbers.slice(0, 5).map(n => n.toString().padStart(2, '0')).join(' '),
      numbers.slice(5, 10).map(n => n.toString().padStart(2, '0')).join(' '),
      numbers.slice(10, 15).map(n => n.toString().padStart(2, '0')).join(' ')
    ];
    
    const text = lines.join('\n'); //

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Falha técnica ao copiar protocolo:', err);
    });
  };

  /**
   * LÓGICA DE SALVAMENTO COM REDIRECIONAMENTO
   * Intercepta a ação para usuários não logados e dispara o fluxo de login.
   */
  const handleSaveAction = (e: React.MouseEvent) => {
    e.stopPropagation(); //

    if (!isLoggedIn) {
      // REQUISITO: Redirecionar visitante para login com retorno para a página atual
      router.push('/login?redirect=/gerador-inteligente');
      return;
    }

    // Se logado, o controle de duplicidade e limites é feito no page.tsx
    if (savedGamesRemaining <= 0 || saving) return;
    
    onSaveGame(game.numbers, index); //
  };

  return (
    <div 
      onClick={handleCopy}
      className={`p-4 rounded-xl shadow-xl border transition-all cursor-pointer active:scale-[0.98] animate-fade-in relative group ${
        copied 
          ? 'border-green-500 bg-green-900/10' 
          : 'border-slate-800 bg-[#0D1117] hover:border-blue-500/50'
      }`}
    >
      {/* Overlay de Sucesso na Cópia - Design Original */}
      {copied && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-10 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-green-500 font-bold uppercase text-xs tracking-widest">
            <FaCheck /> Copiado_3x5
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {/* Ícones de Nível de Algoritmo */}
          <div className="text-[10px] font-black flex items-center gap-1.5 uppercase text-slate-400">
            {type === 'free'    && <><FaDice    className="text-blue-500" /> Gratuito</>}
            {type === 'basic'   && <><FaStar    className="text-yellow-500" /> Básico</>}
            {type === 'plus'    && <><FaGem     className="text-emerald-500" /> Plus</>}
            {type === 'premium' && <><FaCrown   className="text-purple-500" /> Prêmio</>}
          </div>
          <div className="text-[10px] text-slate-600 font-medium italic">
            Jogo #{index + 1}
          </div>
        </div>

        {/* BOTÃO DE AÇÃO DINÂMICO */}
        <button
          onClick={handleSaveAction}
          disabled={isLoggedIn && (saving || savedGamesRemaining <= 0)}
          className={`p-2.5 rounded-lg transition-all z-20 border ${
            !isLoggedIn
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white'
              : saving
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait'
                : savedGamesRemaining <= 0
                  ? 'bg-red-900/10 border-red-900/20 text-red-900/40 cursor-not-allowed'
                  : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white shadow-[0_0_15px_rgba(37,99,235,0.1)]'
          }`}
        >
          {saving ? (
            <FaSpinner className="animate-spin" />
          ) : !isLoggedIn ? (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter">
              <FaLock className="text-[8px]" /> Entrar
            </div>
          ) : (
            <FaBookmark />
          )}
        </button>
      </div>

      {/* GRID DE DEZENAS - Estética Original "dezena-bola" */}
      <div className="grid grid-cols-5 gap-2 pointer-events-none">
        {game.numbers.map((num, idx) => (
          <div
            key={`dezena-${idx}`}
            className="dezena-bola flex items-center justify-center font-bold text-sm bg-slate-900 border border-slate-800 text-blue-400 w-9 h-9 rounded-full shadow-inner"
          >
            {num.toString().padStart(2, '0')}
          </div>
        ))}
      </div>

      {/* Badge de Esgotamento para Usuários Logados */}
      {isLoggedIn && savedGamesRemaining <= 0 && (
        <div className="absolute -top-2 -right-2 text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter animate-bounce">
          Limite Esgotado
        </div>
      )}
      
      {/* Footer Informativo */}
      {!copied && (
        <div className="mt-3 text-[8px] text-slate-600 uppercase font-black tracking-widest text-center opacity-40 group-hover:opacity-100 transition-opacity italic">
          Clique no card para copiar padrão 3x5
        </div>
      )}
    </div>
  );
}