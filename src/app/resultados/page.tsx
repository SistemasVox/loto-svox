/* =============================================================================
 * ARQUIVO: src/app/resultados/page.tsx
 * STATUS: Lógica corrigida (Loop + Data) | Interface Restaurada (Original)
 * ============================================================================= */

"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';

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

interface Resultado {
  concurso: number;
  dezenas: string;
  data_concurso: string;
}

const LIMIT = 20;

/* BUG DATA: Formatação manual para ignorar fuso horário do JS */
const formatarDataSimples = (dataIso: string) => {
  try {
    const apenasData = dataIso.split('T')[0].split(' ')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return (ano && mes && dia) ? `${dia}/${mes}/${ano}` : "Data Inválida";
  } catch (e) {
    return "Erro na data";
  }
};

export default function ResultadosPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loader = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef(false); 

  const showLoading = useLoadingDelay(loading);

  /* LOOP FIX: useCallback estável sem dependências mutáveis */
  const fetchResultados = useCallback(async (pageNumber: number) => {
    if (isFetching.current) return;
    
    isFetching.current = true;
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch(`/api/resultados?page=${pageNumber}&limit=${LIMIT}`);
      if (!res.ok) throw new Error('Erro ao buscar');
      const data: Resultado[] = await res.json();

      setResultados(prev => {
        const all = pageNumber === 1 ? data : [...prev, ...data];
        const seen = new Set();
        return all.filter(item => {
          const key = `${item.concurso}-${item.data_concurso}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      setHasMore(data.length === LIMIT);
    } catch (err) {
      setErro('Erro ao carregar resultados.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchResultados(1);
  }, [fetchResultados]);

  useEffect(() => {
    if (!loader.current) return;

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchResultados(nextPage);
          return nextPage;
        });
      }
    }, { root: null, rootMargin: "20px", threshold: 1.0 });

    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loading, hasMore, fetchResultados]);

  if (showLoading && resultados.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white mb-2">Resultados Lotofácil</span>
        <span className="text-lg text-gray-300 mb-1">Carregando resultados…</span>
        <span className="text-sm text-gray-500">Aguarde, pode demorar alguns segundos :)</span>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen py-10 px-2 sm:px-4 bg-gray-900 relative flex flex-col items-center justify-center"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "url('/logo1.png')", backgroundRepeat: "no-repeat",
          backgroundPosition: "center", backgroundSize: "cover",
          opacity: 0.13, filter: "brightness(0.95)", width: "100vw", height: "100vh"
        }}
      />

      <h1 className="text-3xl font-bold text-center mb-8 text-purple-300 drop-shadow-lg relative z-10">
        Resultados Lotofácil
      </h1>

      {erro && <p className="text-center text-red-500 relative z-10">{erro}</p>}

      <div className="flex flex-wrap gap-6 justify-center relative z-10">
        {resultados.map((r) => (
          <div
            key={`${r.concurso}-${r.data_concurso}`}
            style={{
              background: "rgba(36, 37, 46, 0.70)", backdropFilter: "blur(2px)",
              borderRadius: "18px", boxShadow: "0 4px 24px #0003",
              border: "1.5px solid #333", minWidth: 260, maxWidth: 320, marginBottom: 18
            }}
            className="p-4 w-full flex flex-col items-center"
          >
            <div className="w-full text-xs text-gray-400 mb-1 text-center">
              Lotofácil / <span className="text-white font-bold">Concurso {r.concurso}</span>{" "}
              <span className="text-gray-300 font-semibold">
                ({formatarDataSimples(r.data_concurso)})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 my-2">
              {r.dezenas.split(',').map((dezena, idx) => (
                <span key={idx} className="dezena-bola">
                  {dezena.padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} style={{ height: 40 }} />

      {loading && resultados.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 z-10">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
          <span className="text-base text-blue-200">Carregando mais resultados…</span>
        </div>
      )}

      {/* RESTAURAÇÃO INTEGRAL DO CSS ORIGINAL */}
      <style>{`
        .dezena-bola {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.35rem;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #181d28;
          color: #ffbaff;
          border: 2.5px solid #ff69e0;
          box-shadow: 0 0 8px #ffbaff44, 0 0 0 #fff;
          margin: 2px;
          text-align: center;
          letter-spacing: 1px;
          transition: transform 0.12s;
        }
        .dezena-bola:hover {
          transform: scale(1.12);
          box-shadow: 0 0 12px #ff69e0cc;
        }
        @media (max-width: 500px) {
          .grid-cols-5 {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}