"use client";

import React, { useEffect, useState } from "react";
import { calcularDiasRestantes } from "@/lib/subscriptionUtils";
import { Check, Zap, Shield, Crown } from "lucide-react";

const CONFIG_PLANOS = [
  {
    id: "FREE",
    nome: "GRATUITO",
    preco: "R$ 0",
    cor: "text-slate-400",
    border: "border-slate-800",
    neon: "shadow-none",
    beneficios: ["3 Jogos/vez", "IA Aleatória", "Vitalício"],
  },
  {
    id: "BASICO",
    nome: "BÁSICO",
    preco: "R$ 19,90",
    cor: "text-orange-500",
    border: "border-orange-500/50",
    neon: "hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    beneficios: ["10 Jogos/vez", "IA Equilibrada", "30 Dias"],
  },
  {
    id: "PLUS",
    nome: "PLUS",
    preco: "R$ 39,90",
    cor: "text-cyan-400",
    border: "border-cyan-400/50",
    neon: "hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    beneficios: ["50 Jogos/vez", "IA Quentes", "30 Dias"],
  },
  {
    id: "PREMIO",
    nome: "PRÊMIO",
    preco: "R$ 59,90",
    cor: "text-pink-500",
    border: "border-pink-500/50",
    neon: "hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    beneficios: ["100 Jogos/vez", "TODAS as IAs", "30 Dias"],
  },
];

export default function AssinaturasPage() {
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<any>(null);
  const [processando, setProcessando] = useState(false);
  const [feedback, setFeedback] = useState("");

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/auth/subscriptions");
      const data = await res.json();
      const ativa = Array.isArray(data) ? data.find((s: any) => s.status === "ACTIVE") : null;
      setAssinaturaAtiva(ativa);
    } catch (err) {
      console.error("Falha ao carregar assinaturas");
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSolicitar = async (plano: string) => {
    setProcessando(true);
    try {
      const res = await fetch("/api/auth/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();
      setFeedback(data.msg || data.error);
      setTimeout(() => setFeedback(""), 5000);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 border-l-4 border-cyan-500 pl-4">
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
          Upgrade de Protocolo
        </h1>
      </div>

      {feedback && (
        <div className="fixed top-20 right-10 z-50 bg-blue-900 border border-blue-500 p-4 rounded shadow-2xl text-blue-400 font-bold text-xs uppercase tracking-widest animate-bounce">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CONFIG_PLANOS.map((plano) => {
          const isAtivo = assinaturaAtiva?.plano === plano.id;
          const diasRestantes = isAtivo ? calcularDiasRestantes(assinaturaAtiva.expiresAt) : 0;

          return (
            <div
              key={plano.id}
              className={`relative bg-[#0f172a]/80 border-2 rounded-3xl p-8 transition-all duration-500 flex flex-col ${
                isAtivo ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_40px_rgba(34,211,238,0.2)] scale-105 z-10' : 'border-slate-800 ' + plano.neon
              }`}
            >
              <div className="text-center mb-8">
                <h3 className={`text-xs font-black tracking-[0.3em] uppercase mb-2 ${plano.cor}`}>
                  {plano.nome}
                </h3>
                <div className="text-4xl font-black text-white tracking-tighter">
                  {plano.preco}
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plano.beneficios.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    <Check size={14} className={isAtivo ? "text-cyan-400" : "text-slate-600"} />
                    {b}
                  </li>
                ))}
              </ul>

              {isAtivo ? (
                <div className="mt-auto p-4 border-2 border-dashed border-cyan-500/40 rounded-xl bg-cyan-950/50 flex flex-col items-center justify-center animate-pulse">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">
                    Protocolo Ativo
                  </span>
                  <span className="text-sm font-black text-white uppercase">
                    Restam {diasRestantes} Dias
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleSolicitar(plano.id)}
                  disabled={processando || plano.id === "FREE"}
                  className={`mt-auto w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                    plano.id === "FREE" 
                    ? "border-slate-800 text-slate-700 cursor-not-allowed" 
                    : "border-slate-700 hover:border-white text-white hover:bg-white hover:text-black"
                  }`}
                >
                  {plano.id === "FREE" ? "Plano Atual" : "Assinar_"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}