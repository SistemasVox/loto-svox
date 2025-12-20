/* ############################################################
   #  File: src/components/NavbarClient.tsx                    #
   ############################################################ */
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavLink {
  label: string
  href: string
  protected?: boolean
}

interface Props {
  initialUserEmail: string | null
}

export function NavbarClient({ initialUserEmail }: Props) {
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      setUserEmail(null)
      setMenuOpen(false)
      router.push('/login')
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const navLinks: NavLink[] = [
    { label: 'Início', href: '/' },
    { label: 'Gerador Inteligente', href: '/gerador-inteligente' },
    { label: 'Resultados', href: '/resultados' },
    { label: 'Lotofácil', href: '/lotofacil' },
    { label: 'Análise', href: '/analise' },
    { label: 'Meus Jogos', href: '/meus-jogos', protected: true },
    { label: 'Minha Conta', href: '/minha-conta', protected: true },
    { label: 'Dashboard', href: '/dashboard', protected: true },
    { label: 'Termos', href: '/termos' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'Contato', href: '/contato' },
  ]

  const navigate = (link: NavLink) => {
    setMenuOpen(false)
    if (link.protected && !userEmail) {
      router.push(`/login?redirect=${encodeURIComponent(link.href)}`)
    } else {
      router.push(link.href)
    }
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm shadow-md">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Nome do Site */}
        <div className="flex-shrink-0">
          <Image
            src="/logo1.png"
            alt="Logo"
            width={120}
            height={40}
            className="cursor-pointer"
            onClick={() => router.push('/')}
          />
        </div>

        {/* Links de Navegação Desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) =>
            (!link.protected || userEmail) && (
              <Button
                key={link.href}
                variant="link"
                onClick={() => navigate(link)}
                className={`
                  ${isActive(link.href) ? 'text-blue-500' : 'text-gray-300 hover:text-white'}
                  transition-colors duration-200
                `}
              >
                {link.label}
              </Button>
            )
          )}
          {userEmail ? (
            <Button onClick={handleLogout} variant="destructive" className="ml-4">
              Sair
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')} variant="default" className="bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
          )}
        </div>

        {/* Botão do Menu Mobile */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm py-4 border-t border-gray-800 shadow-lg">
          <nav className="flex flex-col items-center space-y-3">
            {navLinks.map((link) =>
              (!link.protected || userEmail) && (
                <Button
                  key={link.href}
                  variant="link"
                  onClick={() => navigate(link)}
                  className={`
                    w-full text-center
                    ${isActive(link.href) ? 'text-blue-500' : 'text-gray-300 hover:text-white'}
                    transition-colors duration-200
                  `}
                >
                  {link.label}
                </Button>
              )
            )}
            {userEmail ? (
              <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">
                Sair
              </Button>
            ) : (
              <Button onClick={() => router.push('/login')} variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}