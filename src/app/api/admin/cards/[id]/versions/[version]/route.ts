import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parsePairBody } from "@/lib/admin-cards";
import { deleteVersion, updateVersion } from "@/lib/cards";

/** Actualiza el contenido/metadata de la versión {version} de la card {id}. */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; version: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const version = parseInt(params.version, 10);
  if (!Number.isFinite(version)) {
    return NextResponse.json({ error: "Versión inválida" }, { status: 400 });
  }
  const parsed = parsePairBody(await req.json().catch(() => ({})));
  if ("error" in parsed) {
    return NextResponse.json(
      { error: parsed.error, ...(parsed.details || {}) },
      { status: 400 }
    );
  }
  const { es, en, meta, publish } = parsed.pair;
  if (es.id !== params.id) {
    return NextResponse.json({ error: "El id no coincide con la ruta" }, { status: 400 });
  }
  await updateVersion(params.id, version, es, en, meta, publish);
  return NextResponse.json({ ok: true, id: params.id, version });
}

/** Elimina la versión {version} (ambos idiomas). */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; version: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const version = parseInt(params.version, 10);
  const deleted = await deleteVersion(params.id, version);
  return NextResponse.json({ ok: true, deleted });
}
