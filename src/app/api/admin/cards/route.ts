import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parsePairBody } from "@/lib/admin-cards";
import { addVersion, adminListVersions, createCard } from "@/lib/cards";

/**
 * Crea una card desde { es, en, meta?, publish? }.
 * Si el id ya existe, añade una nueva versión; si no, crea la versión 1.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const parsed = parsePairBody(await req.json().catch(() => ({})));
  if ("error" in parsed) {
    return NextResponse.json(
      { error: parsed.error, ...(parsed.details || {}) },
      { status: 400 }
    );
  }
  const { es, en, meta, publish } = parsed.pair;
  const existing = await adminListVersions(es.id);
  if (existing.length === 0) {
    await createCard(es, en, meta, publish);
    return NextResponse.json({ ok: true, id: es.id, version: 1 });
  }
  const version = await addVersion(es.id, es, en, meta, publish);
  return NextResponse.json({ ok: true, id: es.id, version });
}
