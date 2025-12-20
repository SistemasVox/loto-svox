// src/app/minha-conta/page.tsx

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export const dynamic = "force-dynamic";

export default async function MinhaContaOverview() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) redirect("/login?from=/minha-conta");

  const [totalBets, subscription, unreadNotifications] = await Promise.all([
    prisma.bet.count({ where: { userId: user.id } }),
    prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-6 animate-fadeIn">Status da Conta</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Meu Perfil */}
        <Link
          href="/minha-conta/perfil"
          className="bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-l-4 border-cyan-500 animate-card"
        >
          <h2 className="font-semibold mb-2">Meu Perfil</h2>
          <p><strong>Nome:</strong> {user.name || "–"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <span className="mt-4 inline-block text-cyan-400 hover:text-cyan-200 transition-colors duration-200">
            Editar Perfil
          </span>
        </Link>

        {/* Plano */}
        <Link
          href="/minha-conta/assinaturas"
          className="bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-l-4 border-purple-500 animate-card delay-100"
        >
          <h2 className="font-semibold mb-2">Plano</h2>
          <p>
            {subscription?.plano.toLowerCase() || "free"} (
            {subscription?.status.toLowerCase() || "active"})
          </p>
          {subscription && (
            <p className="text-sm text-gray-400">
              Válido até{" "}
              {format(new Date(subscription.expiresAt), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
          <span className="mt-4 inline-block text-purple-400 hover:text-purple-200 transition-colors duration-200">
            Gerenciar Assinatura
          </span>
        </Link>

        {/* Atividade */}
        <Link
          href="/minha-conta/jogos"
          className="bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-l-4 border-blue-500 animate-card delay-200"
        >
          <h2 className="font-semibold mb-2">Atividade</h2>
          <p><strong>Total de apostas:</strong> {totalBets}</p>
          <p><strong>Notificações não lidas:</strong> {unreadNotifications}</p>
          <span className="mt-4 inline-block text-blue-400 hover:text-blue-200 transition-colors duration-200">
            Ver Histórico de Jogos
          </span>
        </Link>
      </div>
    </div>
  );
}