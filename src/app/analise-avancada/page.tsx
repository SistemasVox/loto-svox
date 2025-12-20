/* =============================================================================
 * ARQUIVO: src/app/analise-avancada/page.tsx
 * DESCRIÇÃO: Página principal de Análise Avançada, fetch client-side com loading visual igual ao do Next.js e fade-in suave.
 * ============================================================================= */

"use client";

import React, { useEffect, useState } from "react";

/* =============================================================================
 * TYPE: Analysis
 * Estrutura dos dados retornados pela API de análise
 * ============================================================================= */
type Analysis = {
  geral: Record<number, number>;
  par: Record<number, number>;
  impar: Record<number, number>;
  primos?: Record<number, number>;
  faixas: { faixa: string; aparicoes: number }[];
  distribuicao: { faixa: string; aparicoes: number }[];
  consecutivos: {
    pares: { par: string; aparicoes: number }[];
    trincas: { tri: string; aparicoes: number }[];
  };
  soma: { average: number; top5: { concurso: number; sum: number }[] };
  repetidos: { count: number; numeros: number[] };
};

/* =============================================================================
 * COMPONENTE: AnaliseAvancadaPage
 * Página principal da Análise Avançada, fetch dos dados, loading e fade-in suave.
 * ============================================================================= */
export default function AnaliseAvancadaPage() {
  // =============================================================================
  // STATES
  // =============================================================================
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [fadeIn, setFadeIn] = useState(false);

  // =============================================================================
  // EFFECT: Busca os dados da API na montagem do componente
  // Efeito de loading mínimo (1500ms) para não "piscar"
  // =============================================================================
  useEffect(() => {
    const start = Date.now();
    fetch("/api/analise-avancada")
      .then((r) => r.json())
      .then(setData)
      .finally(() => {
        const elapsed = Date.now() - start;
        setTimeout(() => setLoading(false), Math.max(1500 - elapsed, 0));
      });
  }, []);

  // =============================================================================
  // EFFECT: Fade-in suave do conteúdo após loading e dados prontos
  // =============================================================================
  useEffect(() => {
    if (!loading && data) {
      setTimeout(() => setFadeIn(true), 60);
    }
  }, [loading, data]);

  // =============================================================================
  // LOADING: Exibe loading igual ao do loading.tsx enquanto carrega os dados
  // =============================================================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 bg-black">
        {/* ----------------------------------------------------
         * Spinner SVG animado (azul, monocromático)
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
    );
  }

  // =============================================================================
  // ERRO: Falha ao carregar os dados
  // =============================================================================
  if (!data) {
    return (
      <p className="text-center py-10 text-red-400">
        ❌ Erro ao carregar análise.
      </p>
    );
  }

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================
  const pad2 = (n: string) => n.padStart(2, "0");
  const fmtNum = (v: number | string) =>
    typeof v === "number" ? v.toLocaleString("pt-BR") : v;

  const makeRows = (obj: Record<number, number>) =>
    Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .map(([d, c]) => [pad2(d), c]);

  const fmtPair = (p: string) => p.split("-").map(pad2).join("-");
  const fmtTri = (t: string) => t.split("-").map(pad2).join("-");

  const descriptions: Record<string, string> = {
    "Aparições Geral": "Número de vezes que cada dezena saiu em todos os concursos.",
    "Concursos Pares": "Aparições apenas nos concursos de número par.",
    "Concursos Ímpares": "Aparições apenas nos concursos de número ímpar.",
    "Concursos Primos": "Aparições em concursos cujo número é primo.",
    "Por Faixa": "Distribuição por faixas de dezenas.",
    "Alta vs Baixa": "Comparação entre dezenas baixas (1-15) vs altas (16-25).",
    "Pares Consecutivos": "Freq. de pares de dezenas consecutivas.",
    "Trincas Consecutivas": "Freq. de trincas de dezenas consecutivas.",
    "Top 5 Somas": "Concursos com maior soma das dezenas.",
    "Repetições Últimos 2": "Dezenas que se repetiram nos 2 últimos concursos.",
  };

  /* =============================================================================
   * COMPONENTE: Table (interno)
   * Tabela de exibição dos dados estatísticos
   * ============================================================================= */
  function Table({
    title,
    emoji,
    headers,
    rows,
  }: {
    title: string;
    emoji: string;
    headers: string[];
    rows: (string | number)[][];
  }) {
    const [selCol, setSelCol] = useState<number | null>(null);

    // =============================================================================
    // HANDLER: Seleção de coluna (mouse down)
    // =============================================================================
    const onMouseDown = (e: React.MouseEvent) => {
      const cell = (e.target as HTMLElement).closest("td,th");
      if (cell instanceof HTMLTableCellElement) setSelCol(cell.cellIndex);
    };
    const clearSel = () => setSelCol(null);

    // =============================================================================
    // RENDERIZAÇÃO DA TABLE
    // =============================================================================
    return (
      <section
        className="flex flex-col bg-gray-800 p-3 rounded-lg shadow-lg select-none"
        onMouseDown={onMouseDown}
        onMouseUp={clearSel}
        onMouseLeave={clearSel}
      >
        {/* ----------------------------------------------------
         * Cabeçalho da tabela com emoji, título e tooltip
         * ---------------------------------------------------- */}
        <h2 className="font-semibold text-center mb-2 text-gray-200">
          <span
            className="inline-flex items-center cursor-help relative tooltip-container"
          >
            <span className="mr-1">{emoji}</span>
            {title}
            <span className="tooltiptext !max-w-xs">
              {descriptions[title] ?? ""}
            </span>
          </span>
        </h2>

        {/* ----------------------------------------------------
         * Tabela com dados (thead/tbody)
         * ---------------------------------------------------- */}
        <div className="overflow-auto" style={{ maxHeight: 240 }}>
          <table
            className={`w-full table-auto border-collapse border border-gray-700 ${
              selCol !== null ? `col-select-${selCol}` : ""
            }`}
          >
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="border border-gray-600 text-center px-2 py-1"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-900 text-gray-100">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  {r.map((c, j) => (
                    <td
                      key={j}
                      className="border border-gray-600 text-center px-2 py-1"
                    >
                      {fmtNum(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // =============================================================================
  // RENDERIZAÇÃO PRINCIPAL DA PÁGINA
  // =============================================================================
  return (
    <main
      className={`
        bg-gray-900 min-h-screen px-4 py-6 text-gray-100
        transition-opacity duration-500
        ${fadeIn ? "opacity-100" : "opacity-0"}
      `}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* ----------------------------------------------------
       * Header da página, com controle de fonte
       * ---------------------------------------------------- */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="font-bold text-2xl">⚙️ Análise Avançada</h1>
        <div className="space-x-2">
          <button
            onClick={() => setFontSize((s) => Math.min(s + 2, 24))}
            className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white"
          >
            🔍➕
          </button>
          <button
            onClick={() => setFontSize((s) => Math.max(s - 2, 10))}
            className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white"
          >
            🔍➖
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------
       * Grid de tabelas principais (geral, par, ímpar, primos)
       * ---------------------------------------------------- */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
      >
        <Table
          emoji="📊"
          title="Aparições Geral"
          headers={["Dez", "Apar"]}
          rows={makeRows(data.geral)}
        />
        <Table
          emoji="🔵"
          title="Concursos Pares"
          headers={["Dez", "Apar"]}
          rows={makeRows(data.par)}
        />
        <Table
          emoji="🔴"
          title="Concursos Ímpares"
          headers={["Dez", "Apar"]}
          rows={makeRows(data.impar)}
        />
        {data.primos && (
          <Table
            emoji="💎"
            title="Concursos Primos"
            headers={["Dez", "Apar"]}
            rows={makeRows(data.primos)}
          />
        )}
      </div>

      {/* ----------------------------------------------------
       * Grid de tabelas secundárias (faixas, distribuição, pares, trincas)
       * ---------------------------------------------------- */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
      >
        <Table
          emoji="📐"
          title="Por Faixa"
          headers={["Faixa", "Apar"]}
          rows={data.faixas.map((f) => [f.faixa, f.aparicoes])}
        />
        <Table
          emoji="⚖️"
          title="Alta vs Baixa"
          headers={["Faixa", "Apar"]}
          rows={data.distribuicao.map((d) => [d.faixa, d.aparicoes])}
        />
        <Table
          emoji="🔗"
          title="Pares Consecutivos"
          headers={["Par", "Freq"]}
          rows={data.consecutivos.pares
            .sort((a, b) => b.aparicoes - a.aparicoes)
            .map((p) => [fmtPair(p.par), p.aparicoes])}
        />
        <Table
          emoji="🔢"
          title="Trincas Consecutivas"
          headers={["Tri", "Freq"]}
          rows={data.consecutivos.trincas
            .sort((a, b) => b.aparicoes - a.aparicoes)
            .map((t) => [fmtTri(t.tri), t.aparicoes])}
        />
      </div>

      <style>{`
        /* Tooltip */
        .tooltip-container { position: relative; }
        .tooltiptext {
          position: absolute; top: -1.5rem; left: 50%; transform: translateX(-50%);
          visibility: hidden; opacity: 0;
          background: #2d2d2d; color: #fff; padding: 4px 8px;
          border-radius: 4px; font-size: 0.75rem;
          white-space: nowrap; pointer-events: none;
          transition: opacity 0.2s;
        }
        .tooltip-container:hover .tooltiptext {
          visibility: visible; opacity: 1;
        }

        /* Seleção de coluna */
        ${[...Array(25).keys()]
          .map(
            (i) => `
          table.col-select-${i} th:nth-child(${i + 1}),
          table.col-select-${i} td:nth-child(${i + 1}) {
            user-select: text;
          }`
          )
          .join("")}

        /* Scrollbar customizada */
        *::-webkit-scrollbar {
          width: 8px; height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #1f1f1f;
        }
        *::-webkit-scrollbar-thumb {
          background-color: #555; border-radius: 4px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background-color: #777;
        }
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #555 #1f1f1f;
        }
      `}</style>
    </main>
  );
}

/* ########################### FIM DO ARQUIVO ########################### */
