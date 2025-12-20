// src/app/forgot-password/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft } from "react-icons/fi";

// =============================================
// PÁGINA DE REDEFINIÇÃO DE SENHA
// =============================================
export default function ForgotPasswordPage() {
  // ===========================================
  // ESTADOS E VALIDAÇÃO
  // ===========================================
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validação de e-mail em tempo real
  useEffect(() => {
    if (email === "") {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(emailRegex.test(email));
    }
  }, [email]);

  // ===========================================
  // SUBMISSÃO DO FORMULÁRIO
  // ===========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    // Validação final do formato do e-mail
    if (!emailRegex.test(email)) {
      setErrorMsg("Formato de e-mail inválido.");
      return;
    }

    setLoading(true);
    
    try {
      // Requisição para API de recuperação de senha
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao processar solicitação.");
      } else {
        // Mensagem genérica de sucesso
        setMessage("Se o e-mail existir em nosso sistema, você receberá instruções para redefinir sua senha.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {/* ======================================= */}
      {/* CARD PRINCIPAL */}
      {/* ======================================= */}
      <div className="w-full max-w-md bg-gray-800/70 border border-gray-700 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
        {/* ===================================== */}
        {/* CABEÇALHO DO CARD */}
        {/* ===================================== */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            VOX<span className="text-blue-500">Strategies</span>
          </h1>
          <p className="text-gray-400">Redefinição de Senha</p>
        </div>
        
        {/* ===================================== */}
        {/* MENSAGENS DE ERRO/SUCESSO */}
        {/* ===================================== */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMsg}
          </div>
        )}
        
        {message && (
          <div className="mb-5 p-3 bg-green-900/30 border border-green-700 text-green-200 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        {/* ===================================== */}
        {/* FORMULÁRIO */}
        {/* ===================================== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="seu@exemplo.com"
                className={`
                  w-full
                  pl-10
                  rounded-lg
                  border ${isEmailValid || email === "" ? "border-gray-700" : "border-red-500"}
                  bg-gray-900 text-white placeholder-gray-500
                  px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition
                `}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isEmailValid && (
              <p className="text-red-400 text-sm mt-1">Formato de e-mail inválido.</p>
            )}
          </div>
          
          {/* =================================== */}
          {/* BOTÃO DE SUBMISSÃO */}
          {/* =================================== */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex justify-center items-center gap-2
              rounded-lg
              bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium
              hover:from-blue-700 hover:to-blue-800
              transition-all
              disabled:opacity-70
              px-4 py-3
              shadow-lg shadow-blue-500/20
              hover:shadow-blue-500/30
              transform hover:-translate-y-0.5
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              "Enviar instruções"
            )}
          </button>
        </form>
        
        {/* ===================================== */}
        {/* LINK VOLTAR AO LOGIN */}
        {/* ===================================== */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <Link 
            href="/login" 
            className="
              inline-flex items-center gap-2
              text-blue-400 hover:text-blue-300
              transition
            "
          >
            <FiArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </main>
  );
}