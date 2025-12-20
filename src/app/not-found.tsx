// src/app/not-found.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiFrown, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marca que estamos no cliente para evitar hydration mismatch
    setIsClient(true);
    
    // Atualiza a contagem regressiva a cada segundo
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redireciona após 5 segundos
    const redirectTimer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);
    
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, []);

  // Renderiza um estado inicial até a hidratação completar
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
        <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 hover:shadow-xl">
          {/* Contador circular estático durante hidratação */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-700 stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <circle
                className="text-blue-500 stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDashoffset="0"
                strokeDasharray="251.2"
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">5</span>
            </div>
          </div>

          {/* Ícone de erro */}
          <div className="flex justify-center mb-4">
            <FiFrown className="h-12 w-12 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold text-red-500 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Página Não Encontrada
          </h2>
          
          <p className="text-gray-400 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <p className="text-gray-500 mb-8">
            Você será redirecionado em <span className="font-bold text-blue-400">5</span> segundos...
          </p>

          <Link 
            href="/" 
            className="
              inline-flex items-center gap-2
              px-6 py-3 
              bg-gradient-to-r from-blue-600 to-blue-700 
              text-white font-medium rounded-lg
              hover:from-blue-700 hover:to-blue-800
              transition-all
              shadow-lg shadow-blue-500/20
              hover:shadow-blue-500/30
              transform hover:-translate-y-0.5
            "
          >
            <FiArrowLeft className="h-5 w-5" />
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 hover:shadow-xl">
        {/* Contador circular animado */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-700 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-blue-500 stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDashoffset="0"
              strokeDasharray="251.2"
              style={{
                strokeDashoffset: `${251.2 - (251.2 * countdown) / 5}px`,
                transition: 'stroke-dashoffset 1s linear'
              }}
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{countdown}</span>
          </div>
        </div>

        {/* Ícone de erro */}
        <div className="flex justify-center mb-4">
          <FiFrown className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-4xl font-bold text-red-500 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Página Não Encontrada
        </h2>
        
        <p className="text-gray-400 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <p className="text-gray-500 mb-8">
          Você será redirecionado em <span className="font-bold text-blue-400">{countdown}</span> segundos...
        </p>

        <Link 
          href="/" 
          className="
            inline-flex items-center gap-2
            px-6 py-3 
            bg-gradient-to-r from-blue-600 to-blue-700 
            text-white font-medium rounded-lg
            hover:from-blue-700 hover:to-blue-800
            transition-all
            shadow-lg shadow-blue-500/20
            hover:shadow-blue-500/30
            transform hover:-translate-y-0.5
          "
        >
          <FiArrowLeft className="h-5 w-5" />
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}