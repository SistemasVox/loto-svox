// src/app/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiLogIn, FiCheck } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

// ======================================================================
// PARTE 1: O CONTEÚDO (Lógica do Login)
// ======================================================================
function LoginContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  
  const redirectTo = params.get('redirect') ?? params.get('from') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn && !loginSuccess) {
      router.push(redirectTo)
    }
  }, [isLoggedIn, redirectTo, router, loginSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })
      
      if (res.status === 401) {
        setErrorMsg('Credenciais inválidas')
        return
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'Erro no servidor')
      }

      setLoginSuccess(true)
      
      setTimeout(() => {
        window.location.href = redirectTo
      }, 1500)
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  if (loginSuccess) {
    return (
      <div className="w-full max-w-md bg-gray-800/70 border border-gray-700 rounded-2xl shadow-2xl px-8 py-10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">VOX<span className="text-blue-500">Strategies</span></h1>
        </div>
        <div className="p-6 bg-green-900/30 border border-green-700 text-green-200 rounded-md flex flex-col items-center">
          <FiCheck className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Login realizado!</span>
          <span className="text-sm mt-2">Redirecionando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-gray-800/70 border border-gray-700 rounded-2xl shadow-2xl px-8 py-10 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">VOX<span className="text-blue-500">Strategies</span></h1>
        <p className="text-gray-400">Entre na sua conta</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-md flex items-center">
          <span className="mr-2">⚠️</span> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-10 rounded-lg border border-gray-700 bg-gray-900 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@exemplo.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
            <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">Esqueceu a senha?</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-10 rounded-lg border border-gray-700 bg-gray-900 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 py-3 transition-all disabled:opacity-70"
        >
          {loading ? 'Entrando...' : <><FiLogIn className="h-5 w-5" /> Entrar</>}
        </button>
      </form>

      <div className="my-6 border-t border-gray-700 flex items-center justify-center relative">
        <span className="bg-gray-800 px-2 text-sm text-gray-500 absolute -top-3">ou</span>
      </div>

      <p className="text-center text-sm text-gray-400">
        Não tem conta? <Link href="/cadastro" className="text-green-400 hover:text-green-300">Cadastre-se</Link>
      </p>
    </div>
  )
}

// ======================================================================
// PARTE 2: O ENVELOPE (Suspense)
// ======================================================================
// É aqui que resolvemos o erro de build!
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
      <Suspense fallback={<div className="text-white">Carregando login...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  )
}