import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

/** True si la petición trae una sesión admin válida (para route handlers / páginas). */
export async function isAdmin(): Promise<boolean> {
  return verifyToken(cookies().get(AUTH_COOKIE)?.value);
}
