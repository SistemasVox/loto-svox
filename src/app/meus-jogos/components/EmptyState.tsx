// src/app/minha-conta/meus-jogos/components/EmptyState.tsx

// ======================================================================
// IMPORTS
// ======================================================================
import React from 'react'
import Link from 'next/link'
import { FaDice, FaArrowRight } from 'react-icons/fa'

// ======================================================================
// COMPONENTE PRINCIPAL: EMPTY STATE
// ======================================================================
export default function EmptyState() {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl bg-gradient-to-br from-gray-900/70 to-gray-800/70 shadow-inner">
      {/* Ícone de destaque */}
      <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-900 to-cyan-800 flex items-center justify-center shadow-lg">
        <FaDice className="text-4xl text-cyan-400 drop-shadow" aria-hidden="true" />
      </div>
      {/* Título */}
      <h3 className="text-xl font-bold text-gray-300 mb-2">
        Nenhum jogo salvo ainda
      </h3>
      {/* Descrição */}
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Você ainda não salvou nenhum jogo. Quando gerar jogos no Gerador Inteligente, você pode salvar seus favoritos para acessá-los depois.
      </p>
      {/* Botão de ação */}
      <Link
        href="/gerador-inteligente"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 focus:ring-2 focus:ring-cyan-400 transition-all shadow"
        tabIndex={0}
        aria-label="Ir para o Gerador Inteligente"
      >
        Ir para o Gerador
        <FaArrowRight />
      </Link>
    </div>
  )
}
