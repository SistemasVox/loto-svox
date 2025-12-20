// src/components/FeaturesSection.tsx
import React from 'react';
import Link from 'next/link';
import { FaChartBar, FaMagic, FaHistory } from 'react-icons/fa'; // importe corretamente
import { ProtectedLink } from './ProtectedLink';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Estatísticas públicas */}
          <div className="p-6 bg-white rounded-lg shadow text-center flex flex-col">
            <FaChartBar className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Estatísticas</h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Veja padrões e probabilidades gratuitamente.
            </p>
            <Link
              href="/analise"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Ver Estatísticas
            </Link>
          </div>

          {/* Gerador Inteligente (público) */}
          <div className="p-6 bg-white rounded-lg shadow text-center flex flex-col">
            <FaMagic className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gerador Inteligente</h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Crie combinações estratégicas em segundos.
            </p>
            <Link
              href="/gerador-inteligente"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Usar Gerador
            </Link>
          </div>

          {/* Resultados históricos com recurso extra para logados */}
          <div className="p-6 bg-white rounded-lg shadow text-center flex flex-col">
            <FaHistory className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Resultados</h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Consulte resultados históricos de forma rápida.
            </p>
            <Link
              href="/resultados"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Ver Resultados
            </Link>
            <ProtectedLink
              href="/historico-salvo"
              className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark transition"
            >
              Meus Resultados Salvos
            </ProtectedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
