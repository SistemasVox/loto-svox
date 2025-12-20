// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// --- PARTE 1: O CONTEÚDO QUE USA SEARCH PARAMS ---
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  // Estados
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmValid, setIsConfirmValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      return;
    }
    fetch(`/api/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((data) => {
        setValidToken(!!data.valid);
      })
      .catch(() => {
        setValidToken(false);
      });
  }, [token]);

  // Validação
  useEffect(() => {
    if (newPassword === "") setIsPasswordValid(true);
    else setIsPasswordValid(newPassword.length >= 6);

    if (confirmPassword === "") setIsConfirmValid(true);
    else setIsConfirmValid(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setErrorMsg("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não conferem.");
      return;
    }
    if (!token) {
      setErrorMsg("Token ausente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao redefinir senha.");
      } else {
        setMessage("Senha redefinida com sucesso! Faça login.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  if (validToken === false) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
        <p className="text-red-500">Link inválido ou expirado.</p>
        <a href="/forgot-password" className="text-primary hover:underline mt-4 block">
          Solicitar novo link
        </a>
      </div>
    );
  }

  if (validToken === null) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
        <p>Verificando token...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Redefinir Senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col relative">
          <label htmlFor="newPassword">Nova Senha</label>
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            className="px-4 py-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-sm text-gray-500"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a nova senha"
            className="px-4 py-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </button>
        {message && <p className="text-green-600 text-sm mt-2 text-center">{message}</p>}
        {errorMsg && <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>}
      </form>
    </div>
  );
}

// --- PARTE 2: O ENVELOPE (SUSPENSE) ---
// Isso resolve o erro de build definitivamente
export default function ResetPasswordPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}