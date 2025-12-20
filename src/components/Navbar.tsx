/* ============================================================
   #  Navbar.tsx  —  Server Component (não precisa "use client") #
   #  Busca o usuário no servidor e injeta no sub-componente    #
   ============================================================ */
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { NavbarClient } from './NavbarClient'

export default async function Navbar() {
  // ---- lê token httpOnly e resolve usuário ---------------
  const token = cookies().get('token')?.value ?? null
  const user  = await getCurrentUser(token)

  return <NavbarClient initialUserEmail={user?.email ?? null} />
}
