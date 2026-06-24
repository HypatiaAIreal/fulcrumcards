import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { setVisibility, VISIBILITIES, type Visibility } from "@/lib/cards";

/** Cambia la visibilidad de una card (todas sus versiones). Body: { visibility }. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { visibility?: string };
  const visibility = String(body.visibility) as Visibility;
  if (!VISIBILITIES.includes(visibility)) {
    return NextResponse.json({ error: "Visibilidad inválida" }, { status: 400 });
  }
  const modified = await setVisibility(params.id, visibility);
  return NextResponse.json({ ok: true, id: params.id, visibility, modified });
}
