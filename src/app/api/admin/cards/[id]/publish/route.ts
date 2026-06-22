import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { publishVersion } from "@/lib/cards";

/** Publica la versión indicada de la card {id} y archiva las demás. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const version = parseInt(String(body.version), 10);
  if (!Number.isFinite(version)) {
    return NextResponse.json({ error: "Versión inválida" }, { status: 400 });
  }
  await publishVersion(params.id, version);
  return NextResponse.json({ ok: true, id: params.id, version, status: "published" });
}
