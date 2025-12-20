/* ==========================================================
   File: src/components/HeaderClient.tsx
   ========================================================== */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

interface User { id: number; email: string; name?: string }
interface Props { initialUser: User | null }

export default function HeaderClient({ initialUser }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialUser)
  const [menuOpen, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setUser(null)
    setOpen(false)
    router.push('/login')
  }

  const navLinks = [
    { href: '/gerador-inteligente', label: 'Gerador Inteligente' },
    { href: '/resultados',          label: 'Resultados' },
    { href: '/analise',             label: 'Análise Pública' },
  ]

  return (
    <header
      className={`
        sticky top-0 z-50 
        bg-gray-900
        shadow backdrop-blur-md
        animate__animated animate__fadeInDown
      `}
    >
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
        {/* Logo com container estilizado */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-1.5">
            <Image 
              src="/logo1.png" 
              alt="Logo" 
              width={30} 
              height={30} 
              priority 
              className="opacity-90"
            />
          </div>
          <span className="font-semibold text-lg text-white">VOX<span className="text-blue-500">Strategies</span></span>
        </Link>

        {/* Restante do código permanece igual... */}
        <nav
          className={`
            hidden md:flex gap-4 
            animate__animated animate__fadeInUp
          `}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="
                px-4 py-2 
                text-sm font-medium 
                text-white 
                border border-gray-600
                rounded-lg
                bg-gray-800
                hover:bg-gray-700
                transition
              "
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpen(!menuOpen)}
              className="
                flex items-center gap-2 
                px-4 py-2 
                rounded-lg
                border border-gray-600 
                bg-gray-800
                text-sm font-medium text-white 
                shadow-sm 
                hover:bg-gray-700
                transition
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Olá,&nbsp;{user.name ?? user.email.split('@')[0]}
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div
                onMouseLeave={() => setOpen(false)}
                className="
                  animate-dropdown 
                  absolute right-0 top-full mt-2
                  w-52 rounded-xl 
                  border border-gray-700
                  bg-gray-800
                  shadow-lg
                "
              >
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm text-white hover:bg-gray-700/50 first:rounded-t-xl transition"
                >
                  Meu&nbsp;Painel
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700/50 last:rounded-b-xl transition"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="
                px-4 py-2 
                text-sm font-medium 
                text-white 
                border border-gray-600
                rounded-lg
                bg-gray-800
                hover:bg-gray-700
                transition
              "
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="
                px-5 py-2 
                rounded-lg
                bg-gradient-to-r from-blue-600 to-blue-700
                text-sm font-medium 
                text-white
                shadow-lg 
                hover:from-blue-700 hover:to-blue-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                transition
              "
            >
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

/* ==========================================================
   Fim de HeaderClient.tsx
   ========================================================== */