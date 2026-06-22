import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveCardPair } from "@/lib/admin-cards";
import { deleteCard } from "@/lib/cards";

/** Actualiza el par ES/EN de la card {id}. */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const result = await saveCardPair(body.es, body.en, params.id);
  return NextResponse.json(result.body, { status: result.status });
}

/** Elimina la card {id} en todos los idiomas. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const deleted = await deleteCard(params.id);
  return NextResponse.json({ ok: true, deleted });
}
