import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = typeof body.user === "string" ? body.user : "";
  const password = typeof body.password === "string" ? body.password : "";

  const adminUser = process.env.ADMIN_USER;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminUser || !hash) {
    return NextResponse.json(
      { error: "Autenticación no configurada en el servidor" },
      { status: 500 }
    );
  }

  if (user !== adminUser || !bcrypt.compareSync(password, hash)) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
