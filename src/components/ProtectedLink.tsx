/* ############################################################
   #  File: src/components/ProtectedLink.tsx                   #
   #  Client Component – link que delega proteção ao servidor  #
   ############################################################ */
'use client'

import { useRouter } from 'next/navigation'

interface ProtectedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * Link “protegido” simplificado: apenas navega.
 * Se o usuário não estiver autenticado, o próprio servidor
 * (middleware ou página) redireciona para /login.
 */
export function ProtectedLink({ href, children, className }: ProtectedLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      role="button"
    >
      {children}
    </a>
  )
}
