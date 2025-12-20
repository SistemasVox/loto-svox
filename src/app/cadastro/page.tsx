// src/app/cadastro/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

// =============================================
// DEBUG GLOBAL
// =============================================
const DEBUG = false;

// Componente de Input Reutilizável
interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  error?: string | null;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  icon,
  showPasswordToggle = false,
  onTogglePassword,
  error,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 rounded-lg bg-gray-900 text-white border ${
            error ? "border-red-500" : "border-gray-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required={required}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
            aria-label={type === "password" ? "Mostrar senha" : "Esconder senha"}
          >
            {type === "password" ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();

  // Estado do formulário
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState({
    img: "",
    token: "",
    input: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    captcha: "",
  });
  const [feedback, setFeedback] = useState({
    error: "",
    success: "",
  });
  const [loading, setLoading] = useState(false);

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // Carrega captcha
  const loadCaptcha = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/captcha");
      const { image, token } = await res.json();
      if (DEBUG) console.log("Captcha:", token);
      
      setCaptcha({
        img: image,
        token: token,
        input: "",
      });
      
      setErrors(prev => ({ ...prev, captcha: "" }));
    } catch (err) {
      if (DEBUG) console.error(err);
      setErrors(prev => ({ ...prev, captcha: "Falha ao carregar captcha." }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Validação em tempo real
  useEffect(() => {
    const newErrors = { ...errors };
    
    if (formData.fullName && formData.fullName.trim().length < 2) {
      newErrors.fullName = "Nome deve ter pelo menos 2 caracteres";
    } else {
      newErrors.fullName = "";
    }
    
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    } else {
      newErrors.email = "";
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    } else {
      newErrors.password = "";
    }
    
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem";
    } else {
      newErrors.confirmPassword = "";
    }
    
    setErrors(newErrors);
  }, [formData, emailRegex]);

  // Carrega captcha inicial
  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });
    
    // Validação final antes de submeter
    const finalErrors = {
      fullName: formData.fullName.trim().length < 2 
        ? "Informe seu nome completo." 
        : "",
      email: !emailRegex.test(formData.email) 
        ? "E-mail inválido." 
        : "",
      password: formData.password.length < 6 
        ? "Senha deve ter no mínimo 6 caracteres." 
        : "",
      confirmPassword: formData.password !== formData.confirmPassword 
        ? "As senhas não conferem." 
        : "",
      captcha: !captcha.input.trim() 
        ? "Digite o captcha." 
        : "",
    };
    
    setErrors(finalErrors);
    
    // Verifica se há erros
    const hasErrors = Object.values(finalErrors).some(error => error !== "");
    if (hasErrors) {
      setFeedback({ error: "Corrija os campos destacados", success: "" });
      return;
    }
    
    setLoading(true);
    
    try {
      // Valida captcha
      const capRes = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: captcha.token, 
          answer: captcha.input 
        }),
      });
      
      const capData = await capRes.json();
      if (!capData.valid) {
        setErrors(prev => ({ ...prev, 
          captcha: "Captcha inválido ou expirado." 
        }));
        await loadCaptcha();
        return;
      }

      // Faz registro
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName: formData.fullName, 
          email: formData.email, 
          password: formData.password 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ 
          error: data.error?.message || "Erro no cadastro.", 
          success: "" 
        });
      } else {
        setFeedback({ 
          error: "", 
          success: "Cadastro realizado com sucesso! 😃" 
        });
        setTimeout(() => router.push("/login?registered=true"), 1200);
      }
    } catch (err) {
      if (DEBUG) console.error(err);
      setFeedback({ 
        error: "Erro de rede. Tente novamente.", 
        success: "" 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, captcha, emailRegex, loadCaptcha, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 transition-all hover:shadow-blue-500/10">
        {/* cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">VOXStrategies</h1>
          <p className="text-gray-400">Criar nova conta</p>
        </div>

        {/* mensagens de feedback */}
        {feedback.error && (
          <div className="mb-5 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-md animate-fadeIn">
            {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="mb-5 p-3 bg-green-900/30 border border-green-700 text-green-200 rounded-md animate-fadeIn">
            {feedback.success}
          </div>
        )}

        {/* formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* nome */}
          <InputField
            label="Nome Completo"
            type="text"
            placeholder="Seu nome completo"
            value={formData.fullName}
            onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
            required
            icon={<FiUser />}
            error={errors.fullName}
          />

          {/* email */}
          <InputField
            label="E-mail"
            type="email"
            placeholder="seu@exemplo.com"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            required
            icon={<FiMail />}
            error={errors.email}
          />

          {/* senha */}
          <InputField
            label="Senha"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            required
            icon={<FiLock />}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          {/* confirmar senha */}
          <InputField
            label="Confirmar Senha"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a senha"
            value={formData.confirmPassword}
            onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
            required
            icon={<FiLock />}
            error={errors.confirmPassword}
          />

          {/* captcha */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Não sou um robô
            </label>
            <div className="flex items-center gap-4 mb-2">
              {captcha.img ? (
                <img
                  src={captcha.img}
                  alt="captcha"
                  className="h-12 rounded-md border border-gray-600"
                />
              ) : (
                <div className="h-12 w-32 bg-gray-700 rounded-md animate-pulse border border-gray-600" />
              )}
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 disabled:opacity-50"
              >
                <FiRefreshCw className="h-4 w-4" />
                Trocar
              </button>
            </div>
            <input
              type="text"
              placeholder="Digite os caracteres"
              value={captcha.input}
              onChange={(e) => setCaptcha(prev => ({ ...prev, input: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg bg-gray-900 text-white border ${
                errors.captcha ? "border-red-500" : "border-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
            {errors.captcha && (
              <p className="text-red-400 text-sm mt-1">{errors.captcha}</p>
            )}
          </div>

          {/* botão de envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium disabled:opacity-70 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cadastrando...
              </>
            ) : (
              <>
                Criar Conta <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          <a 
            href="/login" 
            className="text-green-400 hover:underline transition-colors"
          >
            Já tem conta? Faça login
          </a>
        </p>
      </div>
    </main>
  );
}