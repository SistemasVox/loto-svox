// src/app/page.tsx
import React from 'react'
import Link from 'next/link'
import { FaMagic, FaChartBar, FaHistory } from 'react-icons/fa'

export default function HomePage() {
  return (
    <>
      {/* Hero com efeito vidro mais pronunciado */}
      <section className="relative py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="relative container mx-auto px-4">
          <div className="
            max-w-3xl mx-auto
            p-8
            bg-gray-800/70
            backdrop-blur-2xl
            border border-gray-700
            rounded-2xl
            shadow-2xl
            transform transition-all duration-300
            hover:shadow-xl
          ">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Bem-vindo à <span className="text-blue-500">VOXStrategies</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Plataforma de análise inteligente para loterias.<br/>
              Gere seus jogos, consulte estatísticas e resultados.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Features */}
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 my-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="
          p-6 
          bg-gray-800/70
          backdrop-blur-md
          border border-gray-700
          rounded-2xl
          shadow-lg
          text-center
          transform transition-all duration-300
          hover:shadow-xl
          hover:-translate-y-1
        ">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center">
            <FaChartBar className="text-2xl text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            Estatísticas
          </h3>
          <p className="text-gray-400">
            Veja padrões e probabilidades gratuitamente.
          </p>
        </div>
        
        <div className="
          p-6 
          bg-gray-800/70
          backdrop-blur-md
          border border-gray-700
          rounded-2xl
          shadow-lg
          text-center
          transform transition-all duration-300
          hover:shadow-xl
          hover:-translate-y-1
        ">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center">
            <FaMagic className="text-2xl text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            Gerador Inteligente
          </h3>
          <p className="text-gray-400">
            Crie combinações estratégicas em segundos.
          </p>
        </div>
        
        <div className="
          p-6 
          bg-gray-800/70
          backdrop-blur-md
          border border-gray-700
          rounded-2xl
          shadow-lg
          text-center
          transform transition-all duration-300
          hover:shadow-xl
          hover:-translate-y-1
        ">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center">
            <FaHistory className="text-2xl text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            Resultados
          </h3>
          <p className="text-gray-400">
            Consulte resultados históricos de forma rápida.
          </p>
        </div>
      </section>
    </>
  )
}