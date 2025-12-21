/* =============================================================================
 * ARQUIVO: src/components/gerador/GameCard.tsx
 * DESCRIÇÃO: Card de jogo com funcionalidade de "Click-to-Copy" (3x5) e Salvar.
 * ============================================================================= */

import React, { useState } from 'react'
import { GeneratedGame, GeneratorType } from '@/types/generator'
import { FaDice, FaStar, FaGem, FaCrown, FaBookmark, FaSpinner, FaCheck } from 'react-icons/fa'

interface GameCardProps {
  game: GeneratedGame
  type: GeneratorType
  index: number
  onSaveGame: (numbers: number[], gameId: number) => void
  saving: boolean
  savedGamesRemaining: number
}

export default function GameCard({
  game,
  type,
  index,
  onSaveGame,
  saving,
  savedGamesRemaining,
}: GameCardProps) {
  const [copied, setCopied] = useState(false)

  // --- LÓGICA DE CÓPIA (PADRÃO 3x5) ---
  const handleCopy = () => {
    const numbers = [...game.numbers].sort((a, b) => a - b)
    
    // Formata em 3 linhas de 5 números cada
    const lines = [
      numbers.slice(0, 5).map(n => n.toString().padStart(2, '0')).join(' '),
      numbers.slice(5, 10).map(n => n.toString().padStart(2, '0')).join(' '),
      numbers.slice(10, 15).map(n => n.toString().padStart(2, '0')).join(' ')
    ]
    
    const text = lines.join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(err => {
      console.error('Falha ao copiar jogo:', err)
    })
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que o clique no botão acione a cópia do card
    if (savedGamesRemaining <= 0) {
      alert("Você atingiu o limite de jogos salvos!")
      return
    }
    if (saving) return
    onSaveGame(game.numbers, index)
  }

  return (
    <div 
      onClick={handleCopy}
      className={`p-4 rounded-xl shadow-xl border transition-all cursor-pointer active:scale-[0.98] animate-fade-in relative group ${
        copied ? 'border-green-500 bg-green-50/50' : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Indicador Flutuante de Cópia */}
      {copied && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest">
            <FaCheck /> Copiado_3x5
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold flex items-center gap-1 text-slate-800">
            {type === 'free'    && <><FaDice    className="text-blue-600" /> Gratuito</>}
            {type === 'basic'   && <><FaStar    className="text-orange-500" /> Básico</>}
            {type === 'plus'    && <><FaGem     className="text-emerald-600" /> Plus</>}
            {type === 'premium' && <><FaCrown   className="text-purple-600" /> Prêmio</>}
          </div>
          <div className="text-xs text-slate-500 font-medium italic">
            Jogo #{index + 1}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || savedGamesRemaining <= 0}
          className={`p-2 rounded-lg transition-all z-20 ${
            saving
              ? 'bg-slate-200 cursor-not-allowed'
              : savedGamesRemaining <= 0
                ? 'bg-slate-100 cursor-not-allowed text-slate-300'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-sm border border-blue-200'
          }`}
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaBookmark />}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 pointer-events-none">
        {game.numbers.map((num, idx) => (
          <div
            key={idx}
            className="dezena-bola flex items-center justify-center font-bold"
          >
            {num.toString().padStart(2, '0')}
          </div>
        ))}
      </div>

      {savedGamesRemaining <= 0 && (
        <div className="absolute -top-2 -right-2 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">
          Limite: {savedGamesRemaining}
        </div>
      )}
      
      {/* Dica visual no hover */}
      {!copied && (
        <div className="mt-3 text-[9px] text-slate-400 uppercase font-bold tracking-tighter text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Clique no card para copiar padrão 3x5
        </div>
      )}
    </div>
  )
}