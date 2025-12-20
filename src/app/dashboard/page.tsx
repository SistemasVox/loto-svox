/* ############################################################
   #  File: src/app/dashboard/page.tsx                         #
   #  Server Component – painel do usuário                     #
   ############################################################ */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { 
  IoGameControllerOutline, 
  IoAnalyticsOutline, 
  IoPersonCircleOutline 
} from 'react-icons/io5'
import Card from './Card'
import DashboardLoading from './DashboardLoading' // <- import do loading client

const DEBUG = false
function logDebug(...msg: unknown[]) {
  DEBUG && console.log('[Dashboard DEBUG]', ...msg)
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const tokenValue  = cookieStore.get('token')?.value ?? null
  const user        = await getCurrentUser(tokenValue)

  logDebug('Current user:', user)

  if (!user) {
    redirect('/login?from=/dashboard')
  }

  return (
    <DashboardLoading>
      <div className="min-h-screen relative">
        {/* Gradiente sobreposto - 90% de opacidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/75 via-slate-900/75 to-indigo-900/75 z-0" />
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                Olá, {user.name ?? user.email}!
              </h1>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                Bem-vindo ao seu centro de controle. Gerencie seus jogos, acesse análises avançadas
                e personalize sua experiência.
              </p>
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                href="/meus-jogos"
                icon={<IoGameControllerOutline className="text-2xl" />}
                title="Meus Jogos"
                description="Acesse seu histórico completo, jogos favoritos e coleções pessoais."
                actionText="Ver detalhes"
                color="cyan"
                sound="/sounds/beep-1.mp3"
              />
              <Card
                href="/analise-avancada"
                icon={<IoAnalyticsOutline className="text-2xl" />}
                title="Análise Avançada"
                description="Estatísticas detalhadas, visualizações interativas e insights exclusivos."
                actionText="Explorar dados"
                color="purple"
                sound="/sounds/beep-2.mp3"
              />
              <Card
                href="/minha-conta"
                icon={<IoPersonCircleOutline className="text-2xl" />}
                title="Minha Conta"
                description="Gerencie suas configurações, preferências e assinatura premium."
                actionText="Configurar conta"
                color="blue"
                sound="/sounds/beep-3.mp3"
              />
            </div>
            {/* Additional Elements */}
            <div className="mt-16 text-center">
              <div className="inline-block bg-gray-800 px-6 py-4 rounded-full border border-slate-700">
                <p className="text-gray-300 text-sm">
                  Sistema atualizado • Último acesso: Hoje
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLoading>
  )
}
