// Local: src/app/estatisticas/page.tsx

// Caminho corrigido baseado na sua estrutura 'tree'
import AdminDashboardClient from "../admin/dashboard/AdminDashboardClient";

export default function EstatisticasPage() {
  const emailsAdmin = process.env.ADMIN_EMAILS?.split(",") || [];
  
  return (
    <main className="min-h-screen bg-[#020617] p-4 md:p-8">
      <AdminDashboardClient adminEmails={emailsAdmin} />
    </main>
  );
}