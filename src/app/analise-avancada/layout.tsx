// src/app/analise-avancada/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ReactNode } from 'react'

export default async function AnaliseAvancadaLayout({ children }: { children: ReactNode }) {
  // 1) Pega o token do cookie (async!)
  const cookieStore = await cookies() // <- await aqui!
  const token = cookieStore.get('token')?.value ?? null

  // 2) Valida e busca o usuário
  const user = await getCurrentUser(token)

  // 3) Se não houver user, redireciona imediatamente pro login
  if (!user) {
    redirect(`/login?from=${encodeURIComponent('/analise-avancada')}`)
  }

  // 4) Se estiver logado, renderiza o conteúdo (children => page.tsx)
  return <>{children}</>
}
