// src/app/minha-conta/seguranca/ChangePasswordForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// ── Schema de validação ────────────────────────────────────────────
const schema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "No mínimo 8 caracteres")
      .regex(/[A-Z]/, "Pelo menos 1 letra maiúscula")
      .regex(/\d/, "Pelo menos 1 número"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
    website: z.string().optional(),        // honeypot
    captchaAnswer: z.string().min(1, "Preencha o CAPTCHA"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  })
  // Verifica se a nova senha é diferente da atual
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  // ── React Hook Form ─────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // ── States extras ────────────────────────────────────────────────
  const [showPass, setShowPass] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [captchaImg, setCaptchaImg] = useState<string>("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ── Captcha customizado ──────────────────────────────────────────
  const loadCaptcha = async () => {
    try {
      setCaptchaImg("");
      const res = await fetch("/api/captcha");
      const { image, token } = await res.json();
      setCaptchaImg(image);
      setCaptchaToken(token);
    } catch {
      setMessage("❌ Falha ao carregar CAPTCHA");
    }
  };
  useEffect(() => {
    loadCaptcha();
  }, []);

  // ── Password strength meter ──────────────────────────────────────
  const newPass = watch("newPassword") || "";
  const currentPass = watch("currentPassword") || "";
  const strength = zxcvbn(newPass).score; // 0..4

  // ── Submit handler ──────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    // honeypot
    if (data.website) {
      setMessage("❌ Spam detectado.");
      return;
    }

    // Verificação adicional de senha igual (pode ser redundante mas é importante)
    if (data.newPassword === data.currentPassword) {
      setError("newPassword", {
        type: "manual",
        message: "A nova senha não pode ser igual as anteriores",
      });
      return;
    }

    setMessage("");
    setLoading(true);
    
    try {
      // valida captcha
      const vc = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken, answer: data.captchaAnswer }),
      }).then((r) => r.json());
      if (!vc.valid) {
        setError("captchaAnswer", {
          type: "manual",
          message: "CAPTCHA incorreto ou expirado",
        });
        await loadCaptcha();
        return;
      }

      // troca senha
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });
      const body = await res.json();
      
      if (res.ok && body.ok) {
        setMessage("✅ Senha alterada com sucesso!");
        // Limpa todos os campos após sucesso
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          captchaAnswer: "",
          website: ""
        });
      } else {
        setMessage(`❌ ${body.error || "Falha ao trocar senha"}`);
        // Limpa os campos de senha após erro
        reset({
          ...watch(),
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setMessage("❌ Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
      await loadCaptcha();
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto space-y-6 animate-fadeIn"
    >
      <h3 className="text-2xl font-bold text-white text-center">
        Segurança da Conta
      </h3>

      {/* mensagem geral */}
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-lg animate-fadeInOut ${
            message.startsWith("✅")
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* honeypot */}
      <input
        type="text"
        {...register("website")}
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
      />

      {/* campos de senha */}
      {(["currentPassword", "newPassword", "confirmPassword"] as const).map(
        (field) => {
          const label =
            field === "currentPassword"
              ? "Senha Atual"
              : field === "newPassword"
              ? "Nova Senha"
              : "Confirme a Senha";
          const errorMsg = errors[field]?.message;
          const isNew = field === "newPassword";

          return (
            <div key={field} className="relative">
              <label className="block text-gray-300 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={showPass[field] ? "text" : "password"}
                  {...register(field)}
                  disabled={isSubmitting || loading}
                  className={`w-full p-3 pr-10 rounded-lg bg-gray-900 text-gray-100 border ${
                    errorMsg ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-blue-500"
                  } focus:ring-2 focus:outline-none transition duration-200`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPass((s) => ({ ...s, [field]: !s[field] }))
                  }
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPass[field] ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errorMsg && (
                <p className="text-red-500 mt-1 text-sm">{errorMsg}</p>
              )}

              {isNew && newPass && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <span>Força da senha:</span>
                    <span>
                      {[
                        "Muito Fraca",
                        "Fraca",
                        "Média",
                        "Forte",
                        "Muito Forte",
                      ][strength]}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength / 4) * 100}%` }}
                      className={`h-full rounded-full ${
                        strength < 2
                          ? "bg-red-500"
                          : strength < 4
                          ? "bg-yellow-400"
                          : "bg-green-500"
                      }`}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  
                  {/* Mensagem adicional quando senha igual */}
                  {newPass === currentPass && currentPass && (
                    <p className="text-red-500 mt-1 text-sm">
                      A nova senha não pode ser igual as anteriores
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        }
      )}

      {/* CAPTCHA customizado */}
      {captchaImg && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-300">Verificação</label>
            <button 
              type="button" 
              onClick={loadCaptcha}
              disabled={loading}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Recarregar
            </button>
          </div>
          <img
            src={captchaImg}
            alt="CAPTCHA"
            className="mb-2 w-full rounded-lg border border-gray-700"
          />
          <input
            type="text"
            {...register("captchaAnswer")}
            placeholder="Digite o texto acima"
            disabled={isSubmitting || loading}
            className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
          />
          {errors.captchaAnswer && (
            <p className="text-red-500 mt-1 text-sm">
              {errors.captchaAnswer.message}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
      >
        {(isSubmitting || loading) ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Atualizando…
          </span>
        ) : (
          "Atualizar Senha"
        )}
        {(isSubmitting || loading) && (
          <span className="absolute inset-0 bg-blue-700 opacity-30 animate-pulse"></span>
        )}
      </button>
    </motion.form>
  );
}