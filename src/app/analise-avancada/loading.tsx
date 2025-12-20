/* =============================================================================
 * ARQUIVO: src/app/analise-avancada/loading.tsx
 * DESCRIÇÃO: Tela de carregamento para a rota /analise-avancada (VOXStrategies),
 *            visual monocromático com detalhe azul (padrão do projeto).
 * ============================================================================= */

import React from 'react'

/* =============================================================================
 * COMPONENTE: LoadingAnaliseAvancada
 * Exibe spinner animado e mensagem enquanto a análise é carregada
 * ============================================================================= */
export default function LoadingAnaliseAvancada() {
  // =============================================================================
  // RENDERIZAÇÃO
  // =============================================================================
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 bg-black">
      {/* ----------------------------------------------------
       * Spinner SVG animado (ícone central de carregamento, azul)
       * ---------------------------------------------------- */}
      <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="#ccc"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
      {/* ----------------------------------------------------
       * Título e frases amigáveis para feedback ao usuário
       * ---------------------------------------------------- */}
      <span className="text-xl font-semibold text-white mb-2">
        Análise Avançada
      </span>
      <span className="text-lg text-gray-300 mb-1">
        Carregando dados estatísticos…
      </span>
      <span className="text-sm text-gray-500">
        Aguarde, pode demorar alguns segundos :)
      </span>
    </div>
  )
}

/* ########################### FIM DO ARQUIVO ########################### */
