/* =============================================================================
 * ARQUIVO: src/app/minha-conta/jogos/ResumoJogos.tsx
 * DESCRIÇÃO: Componente de resumo de apostas salvas (modelo Bet) com link para gerenciamento
 * ============================================================================= */

'use client'

/* =============================================================================
 * IMPORTS
 * ============================================================================= */
import Link from 'next/link'

/* =============================================================================
 * PROPS E INTERFACES
 * ============================================================================= */
interface ResumoJogosProps {
  total: number   // total de apostas salvas
}

/* =============================================================================
 * COMPONENTE PRINCIPAL: ResumoJogos
 * ============================================================================= */
export default function ResumoJogos({ total }: ResumoJogosProps) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg text-center">
      {/* Texto com total de apostas salvas */}
      <p className="text-gray-200 mb-4">
        Você tem <span className="font-bold text-white">{total}</span> jogos salvos.
      </p>
      {/* Botão para ir à página de gerenciamento de apostas */}
      <Link href="/minha-conta/meus-jogos">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Ver e Gerenciar
        </button>
      </Link>
    </div>
  )
}

/* =============================================================================
 * FIM DO ARQUIVO
 * ============================================================================= */
