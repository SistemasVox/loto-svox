// src/app/gabarito/page.tsx
"use client";

import React, { useState, useEffect } from "react";

interface Registro {
  data_concurso: string;
  concurso: number;
  dezenas: string; // ex: "01,02,03,..."
}

export default function GabaritoPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [numerosSorteados, setNumerosSorteados] = useState("");
  const [apuracao, setApuracao] = useState<
    { acertos: number; hits: string[] }[]
  >([]);

  // Busca os jogos já inseridos (copiado do loto-crud)
  const atualizarLista = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/loto");
      const data = await res.json();
      setRegistros(data);
    } catch (err) {
      console.error("Erro ao carregar registros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    atualizarLista();
  }, []);

  // Port da função parse_numeros_sorteados do seu Python
  const parseNumeros = (texto: string): string[] => {
    const limpo = texto.replace(/\D/g, "");
    const pares = limpo.match(/.{1,2}/g) || [];
    return pares.map((n) => n.padStart(2, "0"));
  };

  // Apura os acertos usando lógica do Python
  const handleApurar = () => {
    const sorteados = new Set(parseNumeros(numerosSorteados));
    const resultado = registros.map((reg) => {
      const dezenas = reg.dezenas.split(",");
      const hits = dezenas.filter((d) => sorteados.has(d));
      return { acertos: hits.length, hits };
    });
    setApuracao(resultado);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 relative bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header inspirado no Gerador Inteligente */}
        <header className="mb-12 bg-gray-900/90 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8 text-center">
          <h1
            className="text-4xl font-bold mb-4 inline-block"
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #22c55e 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Gabarito de Jogos
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <input
              type="text"
              value={numerosSorteados}
              onChange={(e) => setNumerosSorteados(e.target.value)}
              placeholder="Números sorteados (ex: 01,02,03...)"
              className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-green-600 w-full sm:w-auto"
            />
            <button
              onClick={handleApurar}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-bold transition-shadow shadow"
            >
              Apurar
            </button>
          </div>
        </header>

        {/* Lista de cartões de jogos */}
        {loading ? (
          <p className="text-center text-gray-300">Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {registros.map((reg, i) => (
              <div
                key={reg.concurso}
                className="jogo-card border border-gray-700 rounded-lg p-6 bg-gray-800 text-white transition-transform"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Concurso {reg.concurso} –{" "}
                  <span className="text-green-400">
                    {apuracao[i]?.acertos ?? 0} acertos
                  </span>
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {reg.dezenas.split(",").map((num) => (
                    <div
                      key={num}
                      className={`numero ${
                        apuracao[i]?.hits.includes(num)
                          ? "numero-acerto"
                          : ""
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estilos globais portados do Python + GI */}
      <style jsx global>{`
        .jogo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .numero {
          background-color: #007bff;
          color: #fff;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .numero-acerto {
          background-color: #28a745;
        }
      `}</style>
    </div>
  );
}
