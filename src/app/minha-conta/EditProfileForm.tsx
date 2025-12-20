// src/app/minha-conta/EditProfileForm.tsx
"use client";

import React, { useState, useEffect } from "react";

type Props = {
  initialName: string;
  initialEmail: string;
  onSuccess: (user: { name: string; email: string }) => void;
};

export default function EditProfileForm({ 
  initialName, 
  initialEmail, 
  onSuccess 
}: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [honeypot, setHoneypot] = useState("");
  const [captchaImg, setCaptchaImg] = useState<string>();
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1️⃣ Puxa um novo CAPTCHA ao montar (ou ao recarregar)
  const loadCaptcha = async () => {
    try {
      setCaptchaImg(undefined);
      const res = await fetch("/api/captcha");
      const { image, token } = await res.json();
      setCaptchaImg(image);
      setCaptchaToken(token);
      setCaptchaAnswer("");
    } catch {
      setMessage("❌ Falha ao carregar CAPTCHA");
    }
  };
  
  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setMessage("❌ Spam detectado.");
      return;
    }
    if (!captchaAnswer.trim()) {
      setMessage("❌ Preencha o CAPTCHA.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 2️⃣ Valida CAPTCHA
      const vc = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken, answer: captchaAnswer }),
      }).then((r) => r.json());

      if (!vc.valid) {
        setMessage("❌ CAPTCHA incorreto ou expirado.");
        await loadCaptcha();
        return;
      }

      // 3️⃣ Atualiza perfil
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setMessage("✅ Perfil atualizado!");
        onSuccess(data.user);
      } else {
        setMessage(`❌ ${data.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      setMessage("❌ Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
      await loadCaptcha();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg
        transform transition-all duration-300 hover:shadow-xl hover:scale-[1.005]"
    >
      {/* honeypot invisível */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        style={{ display: "none" }}
      />

      <h3 className="text-xl font-semibold text-white mb-4 animate-fadeIn">
        Editar Perfil
      </h3>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center animate-fadeInOut ${
            message.startsWith("✅") 
              ? "bg-green-500/20 text-green-300 border border-green-500/30" 
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Nome</label>
        <input
          type="text"
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700
            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700
            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
      </div>

      {/* CAPTCHA */}
      {captchaImg && (
        <div className="mb-5 animate-fadeIn">
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
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <img 
              src={captchaImg} 
              alt="CAPTCHA" 
              className="border rounded-lg w-32 h-12 object-cover"
            />
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Digite o texto acima"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 rounded-lg bg-gray-900 text-gray-100 border border-gray-700
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white font-bold 
          disabled:opacity-50 relative overflow-hidden transition-all duration-300
          shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando…
          </span>
        ) : (
          "Salvar"
        )}
        {loading && (
          <span className="absolute inset-0 bg-blue-700 opacity-30 animate-pulse"></span>
        )}
      </button>
    </form>
  );
}