// src/app/minha-conta/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  IoPersonCircleOutline,
  IoLockClosedOutline,
  IoListOutline,
  IoReceiptOutline,
  IoNotificationsOutline,
} from "react-icons/io5";

export const dynamic = "force-dynamic";

export default async function MinhaContaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  const user = await getCurrentUser(token);
  if (!user) redirect("/login?from=/minha-conta");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row py-12 px-4 md:px-0">
        <aside className="md:w-1/4 mb-8 md:mb-0">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold mb-6 animate-fadeIn">Minha Conta</h2>
            <nav>
              <ul className="space-y-4">
                {[
                  { href: "/minha-conta", icon: <IoPersonCircleOutline size={20} />, label: "Perfil" },
                  { href: "/minha-conta/seguranca", icon: <IoLockClosedOutline size={20} />, label: "Segurança" },
                  { href: "/minha-conta/jogos", icon: <IoListOutline size={20} />, label: "Jogos" },
                  { href: "/minha-conta/assinaturas", icon: <IoReceiptOutline size={20} />, label: "Assinaturas" },
                  { href: "/minha-conta/notificacoes", icon: <IoNotificationsOutline size={20} />, label: "Notificações" },
                ].map((item, index) => (
                  <li key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg group transition-all duration-300 hover:bg-gray-700 hover:translate-x-1"
                    >
                      <span className="transition-transform duration-300 group-hover:scale-125">
                        {item.icon}
                      </span>
                      <span className="transition-all duration-300 group-hover:font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
        <main className="md:w-3/4 md:pl-8 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}