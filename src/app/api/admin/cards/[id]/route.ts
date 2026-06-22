import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deleteCard } from "@/lib/cards";

/** Elimina la card {id} entera (todas las versiones, todos los idiomas). */
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
