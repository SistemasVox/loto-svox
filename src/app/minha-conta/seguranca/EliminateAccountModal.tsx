"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function EliminateAccountModal({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isConfirmed = confirmText.toUpperCase() === "DELETAR";

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    if (res.ok) router.push("/login");
    else alert("Erro ao excluir conta");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-black border-[3px] border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.2)] w-full max-w-lg rounded-[40px] p-10 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-600 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
        <div className="flex items-center justify-center gap-4 mb-8"><ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" /><h2 className="text-2xl font-black text-white uppercase italic">Eliminar Conta</h2></div>
        <div className="bg-[#111] border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
          <p className="text-white font-bold text-[10px] uppercase mb-4 tracking-widest">Ação <span className="text-red-600 underline">Irreversível</span>. Você perderá:</p>
          <ul className="space-y-2 text-gray-500 font-bold text-[9px] uppercase tracking-widest list-disc ml-4"><li>Jogos Favoritos</li><li>Assinaturas Ativas</li><li>Identificador Operacional</li></ul>
        </div>
        <div className="text-center mb-6">
          <p className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-4 italic">Ação Crítica. Digite <span className="text-red-500">DELETAR</span>:</p>
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="_ _ _ _ _ _ _" className="w-full bg-[#0a0a0a] border border-gray-800 p-5 rounded-2xl text-center text-white font-mono text-2xl tracking-[0.3em] focus:border-[#00FFFF] outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="py-5 rounded-2xl border border-gray-800 text-gray-600 font-bold uppercase tracking-widest text-xs">Abortar</button>
          <button disabled={!isConfirmed || loading} onClick={handleDelete} className={`py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${isConfirmed ? "bg-red-600/20 text-red-500 border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "bg-gray-900 text-gray-700 border border-gray-800"}`}>
            {loading ? "Processando..." : "Eliminar_"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}