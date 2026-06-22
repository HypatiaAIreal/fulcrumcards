// Autenticación admin: firma/verificación JWT con jose (compatible con edge).
// La verificación de credenciales (bcrypt) vive en la route de login (runtime node).
import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "fc_admin";

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET no está definida");
  return new TextEncoder().encode(s);
}

/** Emite un JWT de sesión admin (7 días). */
export async function createToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

/** Verifica un JWT; true si es válido y no ha expirado. */
export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
