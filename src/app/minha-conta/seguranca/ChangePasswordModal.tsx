"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import { motion } from "framer-motion";
import { XMarkIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const schema = z.object({
  currentPassword: z.string().min(1, "Obrigatório"),
  newPassword: z.string().min(8, "Mínimo 8 caracteres").regex(/[A-Z]/, "Pelo menos 1 maiúscula").regex(/\d/, "Pelo menos 1 número"),
  confirmPassword: z.string().min(1, "Confirme a senha"),
  captchaAnswer: z.string().min(1, "Preencha o captcha"),
}).refine(d => d.newPassword === d.confirmPassword, {
  path: ["confirmPassword"], message: "Senhas não coincidem"
});

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [showPass, setShowPass] = useState(false);
  const [captcha, setCaptcha] = useState({ img: "", token: "" });
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const newPass = watch("newPassword") || "";
  const strength = zxcvbn(newPass).score;

  const loadCaptcha = async () => {
    const res = await fetch("/api/captcha").then(r => r.json());
    setCaptcha({ img: res.image, token: res.token });
  };

  useEffect(() => { loadCaptcha(); }, []);

  const onSubmit = async (data: any) => {
    setStatus(null);
    try {
      const vc = await fetch("/api/captcha", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captcha.token, answer: data.captchaAnswer }),
      }).then(r => r.json());

      if (!vc.valid) {
        setStatus({ msg: "❌ CAPTCHA incorreto", type: 'error' });
        loadCaptcha();
        return;
      }

      const res = await fetch("/api/auth/change-password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus({ msg: "✅ Senha atualizada!", type: 'success' });
        setTimeout(onClose, 2000);
      } else {
        const err = await res.json();
        setStatus({ msg: `❌ ${err.error}`, type: 'error' });
        loadCaptcha();
      }
    } catch { setStatus({ msg: "❌ Erro de rede", type: 'error' }); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1a] border border-gray-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        <div className="flex items-center gap-3 mb-6"><ShieldCheckIcon className="h-8 w-8 text-white" /><h2 className="text-2xl font-black text-white uppercase italic">Segurança</h2></div>
        
        {status && <div className={`mb-4 p-3 rounded-lg text-xs font-bold ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{status.msg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-purple-400 text-[10px] font-black uppercase mb-1 tracking-widest">E-mail</label>
            <input type="text" disabled value="dj.marcelo.2009@gmail.com" className="w-full bg-[#111] border border-gray-800 p-3 rounded-xl text-gray-600 font-mono text-xs cursor-not-allowed" />
          </div>

          <div className="space-y-3">
            <label className="block text-white text-[10px] font-black uppercase tracking-widest">Nova Senha</label>
            <div className="relative">
              <input {...register("newPassword")} type={showPass ? "text" : "password"} className="w-full bg-[#111] border border-gray-800 p-3 rounded-xl text-white text-sm focus:border-yellow-500 outline-none" placeholder="Digite a nova senha" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-500 italic text-[10px] uppercase font-bold">{showPass ? "Ocultar" : "Mostrar"}</button>
            </div>
            {newPass && (
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-1">
                <motion.div animate={{ width: `${(strength + 1) * 20}%` }} className={`h-full ${strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              </div>
            )}
            <input {...register("confirmPassword")} type="password" className="w-full bg-[#111] border border-gray-800 p-3 rounded-xl text-white text-sm focus:border-yellow-500 outline-none" placeholder="Confirme a nova senha" />
          </div>

          <div className="bg-red-950/20 p-4 rounded-2xl border border-red-900/30">
            <label className="block text-red-500 text-[10px] font-black uppercase mb-2 tracking-widest italic">Senha Atual (Obrigatório)</label>
            <input {...register("currentPassword")} type="password" placeholder="Sua senha atual" className="w-full bg-black/40 border border-red-900/30 p-3 rounded-xl text-white text-sm focus:border-red-500 outline-none" />
          </div>

          {captcha.img && (
            <div className="space-y-2">
              <img src={captcha.img} alt="Captcha" className="w-full rounded-xl border border-gray-800" />
              <input {...register("captchaAnswer")} type="text" placeholder="Resposta do Captcha" className="w-full bg-[#111] border border-gray-800 p-3 rounded-xl text-white text-sm outline-none" />
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#FFE300] hover:bg-[#FFD700] py-4 rounded-2xl text-black font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? "Processando..." : "Atualizar Senha"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}