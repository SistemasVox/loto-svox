// src/app/admin/page.tsx
export const dynamic = "force-dynamic"; //

import { checkAdminAccess } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./dashboard/AdminDashboardClient";

export default async function AdminPage() {
  const admin = await checkAdminAccess();
  if (!admin) redirect("/login");

  return <AdminDashboardClient statsIniciais={null} />;
}