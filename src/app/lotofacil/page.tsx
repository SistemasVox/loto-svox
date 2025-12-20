// ===========================================
// src/app/lotofacil/page.tsx
// ===========================================
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LotofacilPage() {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");

  let payload: { userId: number };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
  } catch {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) redirect("/login");

  // Aqui o usuário está autenticado
  return (
    <main className="pt-20 px-4">
      <h1 className="text-2xl font-bold mb-4">Lotofácil</h1>
      {/* Conteúdo protegido */}
    </main>
  );
}
// ===========================================  
// FIM de src/app/lotofacil/page.tsx  
// ===========================================
