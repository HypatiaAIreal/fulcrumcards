import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parsePairBody } from "@/lib/admin-cards";
import { addVersion } from "@/lib/cards";

/** Añade una versión nueva a la card {id} desde { es, en, meta?, publish? }. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  if (es.id !== params.id) {
    return NextResponse.json(
      { error: "El id del cuerpo no coincide con la ruta" },
      { status: 400 }
    );
  }
  const version = await addVersion(params.id, es, en, meta, publish);
  return NextResponse.json({ ok: true, id: params.id, version });
}
