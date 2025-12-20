// src/app/estatisticas/page.tsx
import AdminDashboardClient from "@/components/AdminDashboardClient";

/**
 * Heurística H8: Estética e Design Minimalista.
 * Página dedicada para visualização de métricas do sistema.
 */
export default function EstatisticasPage() {
  // Nota: Esta página deve ser protegida se conter dados sensíveis
  return (
    <main className="min-h-screen bg-[#020617] p-4 md:p-8">
      <header className="mb-10 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold tracking-[0.2em] text-orange-500 uppercase">
          {">"}_ ESTATÍSTICAS E MÉTRICAS
        </h1>
      </header>

      {/* Como o componente agora está em src/components, o import funciona */}
      <AdminDashboardClient adminEmails={process.env.ADMIN_EMAILS?.split(",") || []} />
    </main>
  );
}