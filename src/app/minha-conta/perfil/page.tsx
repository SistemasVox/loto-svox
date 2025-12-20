// src/app/minha-conta/perfil/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProfileSection from "../ProfileSection";
import ProfileAvatarForm from "../ProfileAvatarForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) redirect("/login?from=/minha-conta/perfil");

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

      <div className="space-y-8">
        <section className="bg-gray-800 p-6 rounded-xl shadow">
          <ProfileAvatarForm
            currentUrl={user.avatarUrl}
            name={user.name || ""}
            email={user.email}
          />
        </section>

        <section className="bg-gray-800 p-6 rounded-xl shadow">
          <ProfileSection
            initialName={user.name || ""}
            initialEmail={user.email}
          />
        </section>
      </div>
    </div>
  );
}
