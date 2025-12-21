import { getCurrentUser } from "./auth";
import { cookies } from "next/headers";

/**
 * Valida se o usuário logado possui registro na tabela AdminRole.
 * Esta abordagem é imune a falhas de variáveis de ambiente do PM2.
 */
export async function checkAdminAccess() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || null;
    
    // O usuário já retorna com o objeto 'role' se for administrador
    const user = await getCurrentUser(token);
    
    if (!user) {
      console.warn("[ADMIN-SECURITY] Tentativa de acesso sem usuário válido.");
      return null;
    }

    // Verificação baseada na relação do banco de dados
    if (!user.role) {
      console.error(`[403] Acesso negado para: ${user.email}. Usuário não possui privilégios de AdminRole.`);
      return null;
    }

    // Retorna o usuário com todos os privilégios confirmados
    return user;
  } catch (erro) {
    console.error("[CRITICAL] Falha catastrófica no motor de autorização admin:", erro);
    return null;
  }
}