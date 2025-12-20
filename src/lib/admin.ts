import { getCurrentUser } from "./auth";
import { cookies } from "next/headers";

export async function checkAdminAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = await getCurrentUser(token);
  
  if (!user) return null;

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return adminEmails.includes(user.email) ? user : null;
}