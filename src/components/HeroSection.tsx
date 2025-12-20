// src/components/HeroSection.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { FaMagic, FaHistory, FaUser } from 'react-icons/fa'

export default function HeroSection() {
  return (
    <section id="hero" className="relative py-16">
      {/* Fundo gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10"></div>
      
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">
          VOX<span className="text-blue-500">Strategies</span>
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Plataforma de análise inteligente para loterias.  
          Gere seus jogos e consulte estatísticas gratuitamente.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Gerador Inteligente */}
          <Link
            href="/gerador-inteligente"
            className="
              inline-flex items-center gap-2 
              px-6 py-3 
              bg-gradient-to-r from-blue-600 to-blue-700 
              text-white font-medium
              rounded-lg
              shadow-lg shadow-blue-500/20
              hover:from-blue-700 hover:to-blue-800
              hover:shadow-blue-500/30
              transform hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <FaMagic /> Gerador Inteligente
          </Link>

          {/* Consultar Resultados */}
          <Link
            href="/resultados"
            className="
              inline-flex items-center gap-2 
              px-6 py-3 
              bg-gray-800
              border border-gray-700
              text-white
              rounded-lg
              shadow-lg
              hover:bg-gray-700
              hover:shadow-gray-700/20
              transform hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <FaHistory /> Consultar Resultados
          </Link>

          {/* Meus Jogos */}
          <Link
            href="/meus-jogos"
            className="
              inline-flex items-center gap-2 
              px-6 py-3 
              bg-gradient-to-r from-orange-600 to-orange-700 
              text-white font-medium
              rounded-lg
              shadow-lg shadow-orange-500/20
              hover:from-orange-700 hover:to-orange-800
              hover:shadow-orange-500/30
              transform hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <FaUser /> Meus Jogos
          </Link>
        </div>
      </div>
    </section>
  )
}