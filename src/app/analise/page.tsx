// src/app/analise/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { FaChartBar, FaClock } from "react-icons/fa";
import useSound from "use-sound";

/* =============================================================================
 * HOOK: useLoadingDelay – Loading visual mínimo de 3s monocromático/azul
 * ============================================================================= */
function useLoadingDelay(loadingFlag: boolean) {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    if (!loadingFlag) {
      const timer = setTimeout(() => setShowLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loadingFlag]);
  return showLoading && loadingFlag;
}

interface AnaliseData {
  numero: number;
  contador: number;
}
interface AnaliseResponse {
  maisFrequentes: AnaliseData[];
  maioresAtrasos: AnaliseData[];
}

export default function AnalisePage() {
  const [data, setData] = useState<AnaliseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playHover] = useSound("/sounds/beep-1.mp3", { volume: 0.15 });
  const [playSelect] = useSound("/sounds/beep-2.mp3", { volume: 0.15 });

  // controle de seleção por coluna
  const [selectCol, setSelectCol] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // LOADING COM DELAY MÍNIMO DE 1.5s
  const showLoading = useLoadingDelay(loading);

  useEffect(() => {
    const onMouseUp = () => setIsSelecting(false);
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  useEffect(() => {
    fetch("/api/analise")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<AnaliseResponse>;
      })
      .then(setData)
      .catch(() => setError("Falha ao carregar análise."))
      .finally(() => setLoading(false));
  }, []);

  // =============== LOADING VISUAL PADRÃO ==========================
  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white mb-2">Análise de Frequência</span>
        <span className="text-lg text-gray-300 mb-1">Carregando análise…</span>
        <span className="text-sm text-gray-500">Aguarde, pode demorar alguns segundos :)</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleMouseDown = (colIdx: number) => {
    setIsSelecting(true);
    setSelectCol(colIdx);
    playSelect();
  };

  const handleMouseEnter = (colIdx: number) => {
    if (isSelecting) {
      setSelectCol(colIdx);
      playHover();
    }
  };

  function renderTable(
    title: string,
    rows: AnaliseData[],
    cols: [string, string],
    icon: React.ReactNode
  ) {
    return (
      <section className="bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-cyan-900/30 p-2 rounded-lg mr-2 text-cyan-400">
            {icon}
          </div>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="analise-table w-full">
            <thead>
              <tr>
                {cols.map((col, idx) => (
                  <th
                    key={col}
                    onMouseDown={() => handleMouseDown(idx)}
                    onMouseEnter={() => handleMouseEnter(idx)}
                    className={`px-4 py-2 text-center text-xs font-medium uppercase ${
                      selectCol === idx
                        ? "text-cyan-400 bg-cyan-900/20"
                        : "text-gray-300"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ numero, contador }, i) => {
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={numero}
                    className={`
                      ${isEven ? "bg-gray-900/40" : "bg-gray-800/40"}
                      hover:bg-gray-700/50 transition-colors
                    `}
                  >
                    {[numero, contador].map((val, idx) => (
                      <td
                        key={idx}
                        onMouseDown={() => handleMouseDown(idx)}
                        onMouseEnter={() => handleMouseEnter(idx)}
                        className={`
                          px-4 py-2 text-center
                          ${selectCol === idx ? "text-cyan-300 font-semibold" : "text-gray-300"}
                        `}
                      >
                        {idx === 0
                          ? val.toString().padStart(2, "0")
                          : val.toLocaleString("pt-BR")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden text-gray-100">
      {/* Fundo com logo */}
      <div
        className="absolute inset-0 bg-[url('/logo1.png')] bg-center bg-contain bg-no-repeat opacity-90 z-0"
        style={{ backgroundSize: '60%' }}
      />
      {/* Gradiente sobreposto */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-slate-900/90 to-indigo-900/90 z-0" />
      {/* Conteúdo */}
      <div className="relative z-10 py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          📊 Análise das Dezenas
        </h1>
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTable(
            "Dezenas Mais Frequentes",
            data.maisFrequentes,
            ["Dezena", "Aparições"],
            <FaChartBar />
          )}
          {renderTable(
            "Dezenas com Maior Atraso",
            data.maioresAtrasos,
            ["Dezena", "Rodadas sem sair"],
            <FaClock />
          )}
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Sistema atualizado • Último acesso: Hoje</p>
        </div>
      </div>
      {/* estilo de seleção e bordas */}
      <style jsx>{`
        .analise-table {
          border-collapse: collapse;
          width: 100%;
        }
        .analise-table th,
        .analise-table td {
          border: 1px solid #4b5563;
        }
        .analise-table th {
          background-color: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
        }
        .analise-table .selectable {
          user-select: text;
          cursor: text;
        }
      `}</style>
    </main>
  );
}
