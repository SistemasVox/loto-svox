// src/app/admin/page.tsx
import { checkAdminAccess } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/AdminDashboardClient"; // Import atualizado

export default async function AdminPage() {
  const admin = await checkAdminAccess();
  if (!admin) redirect("/login");

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  return (
    <main className="min-h-screen bg-[#020617] p-4 md:p-8">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-orange-500 tracking-[0.3em] uppercase">
          {">"}_ GERENCIAMENTO DE SISTEMA
        </h1>
      </header>

      <AdminDashboardClient adminEmails={adminEmails} />
    </main>
  );
}