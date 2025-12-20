// src/app/contato/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync,
  FaUser,
  FaEnvelope,
  FaComment,
  FaShieldAlt,
  FaPalette
} from "react-icons/fa";

export default function ContactPage() {
  // === estado do form ===
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  
  // Estado para a cor de destaque
  const [accentColor, setAccentColor] = useState<"blue" | "orange" | "green">("blue");
  
  // Referência para o card
  const cardRef = useRef<HTMLDivElement>(null);

  // === anti-bot ===
  const [honeypot, setHoneypot] = useState("");
  const [startTime] = useState(() => Date.now());

  // === captcha ===
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState<null | string>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Função para buscar um novo CAPTCHA
  const loadCaptcha = async () => {
    try {
      setCaptchaImage(null);
      // Simulação de API - em produção seria uma chamada real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gerar um ID único
      const id = Math.random().toString(36).substring(2, 10);
      
      // Gerar uma imagem de captcha simulada
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fundo
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texto
        const text = Math.random().toString(36).substring(2, 8).toUpperCase();
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#333';
        
        // Distorcer o texto
        for(let i = 0; i < text.length; i++) {
          ctx.save();
          ctx.translate(30 + i * 25, 50);
          ctx.rotate((Math.random() - 0.5) * 0.4);
          ctx.fillText(text.charAt(i), 0, 0);
          ctx.restore();
        }
        
        // Adicionar ruído
        for(let i = 0; i < 100; i++) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
          ctx.beginPath();
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        
        // Linhas
        for(let i = 0; i < 5; i++) {
          ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }
        
        setCaptchaId(id);
        setCaptchaImage(canvas.toDataURL());
        setCaptchaAnswer("");
        setStatus("idle");
      }
    } catch {
      console.error("Erro ao gerar CAPTCHA");
    }
  };

  // Ao montar, carrega 1º CAPTCHA
  useEffect(() => {
    loadCaptcha();
  }, []);

  // Validação cliente
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (touched.name) {
      if (formData.name.trim().length < 2)
        newErrors.name = "Nome precisa ter ≥2 caracteres";
      else if (formData.name.length > 100)
        newErrors.name = "Nome não pode exceder 100 caracteres";
    }
    if (touched.email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(formData.email)) newErrors.email = "Email inválido";
    }
    if (touched.message) {
      if (formData.message.trim().length < 10)
        newErrors.message = "Mensagem precisa ter ≥10 caracteres";
      else if (formData.message.length > 1000)
        newErrors.message = "Mensagem não pode exceder 1000 caracteres";
    }
    setErrors(newErrors);
  }, [formData, touched]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (!touched[name]) setTouched((p) => ({ ...p, [name]: true }));
  };
  
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Animação de clique
    if (cardRef.current) {
      cardRef.current.classList.add("scale-[0.98]");
      setTimeout(() => {
        if (cardRef.current) cardRef.current.classList.remove("scale-[0.98]");
      }, 150);
    }

    // Simulação de envio
    setStatus("loading");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validação simulada do CAPTCHA
    if (captchaAnswer.length < 3) {
      setStatus("error");
      return;
    }
    
    // Simulação de envio bem-sucedido
    setStatus("success");
    setFormData({ name: "", email: "", message: "" });
    setTouched({});
    setErrors({});
    
    // Recarregar CAPTCHA após 2 segundos
    setTimeout(() => {
      loadCaptcha();
    }, 2000);
  };

  // Checa se o form está validável
  const isFormValid =
    Object.keys(errors).length === 0 &&
    Object.values(touched).every(Boolean) &&
    Object.values(formData).every((v) => v.trim() !== "") &&
    captchaAnswer.trim() !== "";

  // Classes dinâmicas baseadas na cor de destaque
  const accentClasses = {
    blue: {
      button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      focus: "focus:ring-blue-500 focus:border-blue-500",
      icon: "text-blue-500",
      status: "text-blue-400",
      border: "border-blue-500",
      bg: "bg-blue-500/10"
    },
    orange: {
      button: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
      focus: "focus:ring-amber-500 focus:border-amber-500",
      icon: "text-amber-500",
      status: "text-amber-400",
      border: "border-amber-500",
      bg: "bg-amber-500/10"
    },
    green: {
      button: "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
      focus: "focus:ring-emerald-500 focus:border-emerald-500",
      icon: "text-emerald-500",
      status: "text-emerald-400",
      border: "border-emerald-500",
      bg: "bg-emerald-500/10"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-xl">
        {/* Seletor de cor */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-full p-1 flex border border-gray-700">
            <button 
              onClick={() => setAccentColor('blue')}
              className={`p-2 rounded-full ${accentColor === 'blue' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
              aria-label="Tema azul"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            </button>
            <button 
              onClick={() => setAccentColor('orange')}
              className={`p-2 rounded-full ${accentColor === 'orange' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
              aria-label="Tema laranja"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            </button>
            <button 
              onClick={() => setAccentColor('green')}
              className={`p-2 rounded-full ${accentColor === 'green' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
              aria-label="Tema verde"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            </button>
          </div>
        </div>
        
        {/* Card principal */}
        <div 
          ref={cardRef}
          className="relative bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        >
          {/* Efeito vidro e reflexos */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/70"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/3 rounded-full blur-[80px]"></div>
          </div>
          
          {/* Header do card */}
          <div className="relative z-10 pt-8 pb-4 px-8 border-b border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Entre em Contato</h1>
                <p className="text-gray-400 mt-1">Preencha o formulário abaixo</p>
              </div>
              <div className={`p-3 rounded-lg bg-white/5 border ${accentClasses[accentColor].border}`}>
                <FaPaperPlane className={`text-xl ${accentClasses[accentColor].icon}`} />
              </div>
            </div>
          </div>
          
          {/* Formulário */}
          <div className="relative z-10 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* honeypot invisível */}
              <div className="hidden">
                <input
                  id="website"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* nome */}
              <div className="relative">
                <label htmlFor="name" className="text-gray-300 text-sm font-medium mb-1 block">
                  Nome
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUser className="text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/30 border rounded-lg text-white focus:outline-none transition-all ${
                      touched.name && errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : `border-gray-700 ${accentClasses[accentColor].focus}`
                    }`}
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {touched.name && errors.name && (
                  <span className="text-red-400 text-xs flex items-center mt-1">
                    <FaExclamationTriangle className="mr-1" /> {errors.name}
                  </span>
                )}
              </div>

              {/* e-mail */}
              <div className="relative">
                <label htmlFor="email" className="text-gray-300 text-sm font-medium mb-1 block">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/30 border rounded-lg text-white focus:outline-none transition-all ${
                      touched.email && errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : `border-gray-700 ${accentClasses[accentColor].focus}`
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {touched.email && errors.email && (
                  <span className="text-red-400 text-xs flex items-center mt-1">
                    <FaExclamationTriangle className="mr-1" /> {errors.email}
                  </span>
                )}
              </div>

              {/* mensagem */}
              <div className="relative">
                <label htmlFor="message" className="text-gray-300 text-sm font-medium mb-1 block">
                  Mensagem
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <FaComment className="text-gray-500" />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Escreva sua mensagem..."
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/30 border rounded-lg text-white focus:outline-none min-h-[150px] transition-all ${
                      touched.message && errors.message
                        ? "border-red-500 focus:ring-red-500"
                        : `border-gray-700 ${accentClasses[accentColor].focus}`
                    }`}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="text-right mt-1 text-xs text-gray-500">
                  {formData.message.length}/1000
                </div>
                {touched.message && errors.message && (
                  <span className="text-red-400 text-xs flex items-center mt-1">
                    <FaExclamationTriangle className="mr-1" /> {errors.message}
                  </span>
                )}
              </div>

              {/* CAPTCHA + reload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className={`${accentClasses[accentColor].icon}`} />
                    <span className="text-gray-300 text-sm font-medium">Verificação de segurança</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 transition-colors border border-gray-700"
                    aria-label="Recarregar CAPTCHA"
                  >
                    <FaSync className="text-gray-300" />
                  </button>
                </div>
                
                <div className="flex gap-4">
                  {captchaImage ? (
                    <div className="flex-1 flex items-center justify-center bg-white/5 border border-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={captchaImage}
                        alt="CAPTCHA"
                        className="w-full h-16 object-contain bg-white p-2"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 h-16 rounded-lg bg-gray-800/30 border border-gray-700 animate-pulse" />
                  )}
                  
                  <input
                    type="text"
                    placeholder="Digite o código"
                    className={`flex-1 px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white focus:outline-none transition-all ${accentClasses[accentColor].focus}`}
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                  />
                </div>
              </div>

              {/* enviar */}
              <button
                type="submit"
                disabled={status === "loading" || status === "success" || !isFormValid}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white font-medium rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 ${
                  status === "success"
                    ? "bg-gradient-to-r from-green-600 to-green-700 cursor-not-allowed"
                    : isFormValid
                    ? `bg-gradient-to-r ${accentClasses[accentColor].button}`
                    : "bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed"
                } disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none border border-gray-700`}
              >
                {status === "loading" ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                ) : status === "success" ? (
                  <>
                    <FaCheck className="text-xl" /> Mensagem Enviada!
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xl" /> Enviar Mensagem
                  </>
                )}
              </button>

              {/* feedback */}
              {status === "error" && (
                <div className="mt-4 p-3 bg-gradient-to-r from-red-900/10 to-red-800/10 border border-red-700/30 rounded-lg flex items-start gap-2">
                  <FaExclamationTriangle className="text-red-400 mt-0.5" />
                  <p className="text-red-300">Erro ao enviar. Tente novamente.</p>
                </div>
              )}
              {status === "success" && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-900/10 to-green-800/10 border border-green-700/30 rounded-lg flex items-start gap-2">
                  <FaCheck className="text-green-400 mt-0.5" />
                  <p className="text-green-300">Mensagem enviada com sucesso!</p>
                </div>
              )}
            </form>
          </div>
          
          {/* Rodapé */}
          <div className="relative z-10 border-t border-gray-700/30 px-8 py-4">
            <div className="text-xs text-gray-500 flex items-start gap-2">
              <FaInfoCircle className="text-gray-500 mt-0.5" />
              <p>Todos os campos são obrigatórios. Seus dados só servem para responder você.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}