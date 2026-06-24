import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { setVisibilityMany, VISIBILITIES, type Visibility } from "@/lib/cards";

/**
 * Acción masiva: cambia la visibilidad de varias cards de golpe.
 * Body: { ids: string[], visibility }.
 * (Ruta estática: tiene prioridad sobre /api/admin/cards/[id] en el router.)
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    ids?: unknown;
    visibility?: string;
  };
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
  const visibility = String(body.visibility) as Visibility;
  if (!VISIBILITIES.includes(visibility)) {
    return NextResponse.json({ error: "Visibilidad inválida" }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: "Sin cards seleccionadas" }, { status: 400 });
  }
  const modified = await setVisibilityMany(ids, visibility);
  return NextResponse.json({ ok: true, count: ids.length, visibility, modified });
}
