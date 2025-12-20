// src/app/minha-conta/seguranca/page.tsx
"use client";

import React, { useState } from "react";
import ChangePasswordForm from "./ChangePasswordForm";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SegurancaPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "⚠️ Tem certeza que deseja excluir sua conta? Essa ação é irreversível."
      )
    ) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      } else {
        alert("❌ Erro ao excluir conta.");
      }
    } catch (error) {
      alert("❌ Erro de rede.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6 animate-fadeIn">Segurança da Conta</h1>
      <ChangePasswordForm />

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg animate-fadeIn"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-400">
          Excluir Conta
        </h2>
        <p className="mb-4 text-gray-300">
          Ao excluir sua conta, todos os seus dados (apostas, assinaturas,
          notificações etc.) serão apagados permanentemente.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white font-medium
                   shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden"
        >
          {deleting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Excluindo...
            </span>
          ) : (
            "Excluir minha conta"
          )}
          {deleting && (
            <span className="absolute inset-0 bg-red-700 opacity-30 animate-pulse"></span>
          )}
        </button>
      </motion.section>
    </div>
  );
}