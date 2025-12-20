// src/app/minha-conta/ProfileSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().email("Email inválido"),
  website: z.string().optional(), // honeypot
});

type FormData = z.infer<typeof schema>;

export default function ProfileSection({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: initialName,
      email: initialEmail,
      website: "",
    },
    resolver: zodResolver(schema),
  });

  const watchedEmail = watch("email");

  useEffect(() => {
    reset({ name: initialName, email: initialEmail });
  }, [initialName, initialEmail, reset]);

  useEffect(() => {
    if (message.startsWith("✅") || message.startsWith("📧")) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const onSubmit = async (data: FormData) => {
    if (data.website) {
      setMessage("❌ Spam detectado.");
      return;
    }
    setMessage("");
    setIsLoading(true);

    try {
      if (data.email === initialEmail) {
        const res = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: data.name, email: data.email }),
        });
        if (res.ok) {
          setMessage("✅ Nome atualizado com sucesso!");
          router.refresh();
        } else {
          const err = await res.json();
          setMessage(`❌ ${err.error || "Falha ao atualizar nome"}`);
        }
        return;
      }

      const res = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email }),
      });
      if (res.ok) {
        setMessage(
          "📧 Link de confirmação enviado para o novo e-mail. Verifique sua caixa."
        );
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || "Erro ao solicitar troca de e-mail"}`);
      }
    } catch (error) {
      setMessage("❌ Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message.startsWith("📧") && watchedEmail === initialEmail) {
      setMessage("");
    }
  }, [watchedEmail, initialEmail, message]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] animate-fadeIn"
    >
      {message && (
        <div
          className={`p-3 rounded animate-fadeInOut ${
            message.startsWith("✅") || message.startsWith("📧")
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <input
        type="text"
        {...register("website")}
        className="hidden"
        autoComplete="off"
      />

      <div>
        <label className="block mb-1 text-gray-300">Nome</label>
        <input
          type="text"
          {...register("name")}
          disabled={isSubmitting || isLoading}
          className={`w-full p-3 rounded-lg bg-gray-900 border ${
            errors.name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-700 focus:ring-blue-500"
          } focus:ring-2 focus:outline-none transition duration-200`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Email</label>
        <input
          type="email"
          {...register("email")}
          disabled={isSubmitting || isLoading}
          className={`w-full p-3 rounded-lg bg-gray-900 border ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-700 focus:ring-blue-500"
          } focus:ring-2 focus:outline-none transition duration-200`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 py-3 rounded-lg text-white font-semibold relative overflow-hidden disabled:opacity-50"
      >
        <span className="relative z-10">
          {(isSubmitting || isLoading) ? "Processando…" : "Salvar mudanças"}
        </span>
        {(isSubmitting || isLoading) && (
          <span className="absolute inset-0 bg-blue-700 opacity-50 animate-pulse"></span>
        )}
      </button>
    </form>
  );
}