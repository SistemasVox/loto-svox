"use client";

import React, { useEffect, useState } from "react";
import { calcularDiasRestantes } from "@/lib/subscriptionUtils";
import { Check, Zap, Star } from "lucide-react";
import AssinaturaModal from "@/components/ui/AssinaturaModal";
import { PLANOS_CONFIG } from "@/utils/constants";
import { useNotifications } from "@/hooks/useNotifications";

export default function AssinaturasPage() {
  const { addNotification } = useNotifications();
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/subscriptions").then(r => r.json()).then(data => {
      const ativa = Array.isArray(data) ? data.find((s: any) => s.status === "ACTIVE") : null;
      setAssinaturaAtiva(ativa);
    });
  }, []);

  const handleNotificarPagamento = async () => {
    try {
      await fetch("/api/auth/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoSelecionado.id }),
      });
      
      addNotification({
        type: "success",
        title: "SISTEMA NOTIFICADO",
        message: "O PIX foi enviado para auditoria. Liberação em até 48h úteis.",
      });
      setModalAberto(false);
    } catch {
      addNotification({ type: "error", title: "ERRO I/O", message: "Tente novamente." });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      <div className="border-l-4 border-cyan-500 pl-4 py-1">
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Upgrade de Protocolo</h1>
        <p className="text-slate-500 text-[9px] font-black tracking-[0.3em] uppercase">Maximize sua capacidade estatística</p>
      </div>

      {/* Grid Horizontal Denso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
        {PLANOS_CONFIG.map((plano) => {
          const isAtivo = assinaturaAtiva?.plano === plano.id;
          const dias = isAtivo ? calcularDiasRestantes(assinaturaAtiva.expiresAt) : 0;

          return (
            <div key={plano.id} className={`relative bg-[#0b1120] border-2 rounded-[2rem] p-6 transition-all duration-500 flex flex-col min-h-[480px] ${isAtivo ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}>
              
              <div className="text-center mb-6">
                <h3 className={`text-[9px] font-black tracking-[0.4em] uppercase mb-2 ${plano.cor}`}>{plano.nome}</h3>
                <div className="text-4xl font-black text-white tracking-tighter italic">{plano.preco}</div>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Vigência de 30 dias</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plano.beneficios.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <Check size={14} className={isAtivo ? "text-cyan-400" : "text-green-500/40"} /> {b}
                  </li>
                ))}
              </ul>

              {isAtivo ? (
                <div className="p-4 border-2 border-dashed border-cyan-500/40 rounded-2xl bg-cyan-950/40 text-center">
                  <span className="text-[9px] font-black text-cyan-400 uppercase block mb-1 tracking-widest animate-pulse">Ativo</span>
                  <span className="text-lg font-black text-white uppercase italic tracking-tighter">Restam {dias} Dias</span>
                </div>
              ) : (
                <button
                  onClick={() => { setPlanoSelecionado(plano); setModalAberto(true); }}
                  disabled={plano.id === 'FREE'}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] transition-all border-2 ${
                    plano.id === 'FREE' ? 'border-slate-800 text-slate-700' : 'border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                  }`}
                >
                  {plano.id === 'FREE' ? 'PLANO_ATUAL' : 'ASSINAR_'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <AssinaturaModal isOpen={modalAberto} onClose={() => setModalAberto(false)} plano={planoSelecionado} onConfirmar={handleNotificarPagamento} loading={false} />
    </div>
  );
}