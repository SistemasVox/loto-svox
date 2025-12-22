"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon, TrashIcon, LockClosedIcon } from "@heroicons/react/24/outline";

// Dependências críticas para o build
import ChangePasswordModal from "./ChangePasswordModal";
import EliminateAccountModal from "./EliminateAccountModal";

export default function SegurancaPage() {
  const [activeModal, setActiveModal] = useState<null | "password" | "delete">(null);

  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-10 bg-black/40">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30"><ShieldCheckIcon className="h-8 w-8 text-blue-400" /></div>
        <div><h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Segurança Operacional</h1><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Gestão de Identidade e Integridade</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0d0d0d] border border-gray-800 p-8 rounded-[32px] relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <LockClosedIcon className="h-10 w-10 text-blue-500 mb-6" />
          <h2 className="text-xl font-black text-white uppercase italic mb-2">Credenciais</h2>
          <p className="text-gray-500 text-xs mb-8 leading-relaxed">Gerenciamento de chaves de acesso e proteção por criptografia.</p>
          <button onClick={() => setActiveModal("password")} className="w-full bg-blue-600 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 active:scale-95 transition-all">Modificar Senha</button>
        </div>

        <div className="bg-[#0d0d0d] border border-red-900/20 p-8 rounded-[32px] relative overflow-hidden group hover:border-red-500/50 transition-all">
          <TrashIcon className="h-10 w-10 text-red-500 mb-6" />
          <h2 className="text-xl font-black text-red-500 uppercase italic mb-2">Zona Crítica</h2>
          <p className="text-gray-500 text-xs mb-8 leading-relaxed">Eliminação definitiva de parâmetros, créditos e histórico de usuário.</p>
          <button onClick={() => setActiveModal("delete")} className="w-full bg-red-600/10 border border-red-600/40 py-4 rounded-2xl text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-600/20 active:scale-95 transition-all">Excluir Conta</button>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === "password" && <ChangePasswordModal onClose={() => setActiveModal(null)} />}
        {activeModal === "delete" && <EliminateAccountModal onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
    </div>
  );
}