"use client";

import React, { useRef, useEffect } from "react";
import { X, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface AssinaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  plano: any | null;
  onConfirmar: () => void;
  loading: boolean;
}

export default function AssinaturaModal({ isOpen, onClose, plano, onConfirmar, loading }: AssinaturaModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Heurística: Controle do Usuário (ESC para fechar)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !plano) return null;

  // Heurística: Fechar ao clicar fora
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
    >
      {/* Sombra profunda para destaque */}
      <div className="relative w-full max-w-md bg-[#020617] border border-slate-800 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-40" />

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <ShieldCheck className="text-green-500 mx-auto mb-2 animate-pulse" size={32} />
          <h2 className="text-[10px] font-black tracking-[0.6em] text-green-500 uppercase mb-1">Pagamento Seguro</h2>
          <p className="text-2xl font-black text-white uppercase tracking-tighter italic">
            PLANO {plano.nome} <span className="text-slate-500">—</span> {plano.preco}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="p-5 bg-white rounded-[2rem] shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <QRCodeCanvas value={plano.linkNubank} size={170} level={"H"} />
          </div>
        </div>

        <div className="space-y-4 mb-8 text-center">
          <p className="text-[11px] font-bold text-slate-400">Escaneie ou use o link abaixo:</p>
          <button 
            onClick={() => window.open(plano.linkNubank, "_blank")}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <ExternalLink size={16} /> ABRIR LINK NUBANK
          </button>
        </div>

        <div className="border-t border-slate-900 pt-8 space-y-6">
          <div className="flex items-start gap-3 bg-green-500/5 p-4 rounded-2xl border border-green-500/20 italic">
            <Zap size={20} className="text-green-500 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
              NOTIFIQUE O SISTEMA: <span className="text-green-400">Após o PIX, clique abaixo.</span> Liberação manual em até 48h úteis.
            </p>
          </div>

          <button 
            onClick={onConfirmar}
            disabled={loading}
            className="w-full py-5 bg-green-500 hover:bg-green-400 disabled:bg-slate-800 text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl transition-all shadow-[0_10px_40px_rgba(34,197,94,0.3)]"
          >
            {loading ? "SINCRONIZANDO..." : "✔ JÁ FIZ O PIX"}
          </button>
        </div>
      </div>
    </div>
  );
}