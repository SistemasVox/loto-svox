/* ############################################################
   #  File: src/components/Header.tsx                          #
   #  Server Component – resolve usuário no servidor           #
   ############################################################ */

import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import HeaderClient from './HeaderClient'

export default async function Header() {
  /* ---------- pega token httpOnly ---------- */
  const cookieStore = await cookies()
  const token       = cookieStore.get('token')?.value ?? null
  const user        = await getCurrentUser(token) // { id, email, name? } | null

  /* ---------- delega para client ---------- */
  return <HeaderClient initialUser={user} />
}
