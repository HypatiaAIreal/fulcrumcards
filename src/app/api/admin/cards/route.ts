import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveCardPair } from "@/lib/admin-cards";

/** Crea (o reemplaza) una card a partir del par { es, en }. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const result = await saveCardPair(body.es, body.en);
  return NextResponse.json(result.body, { status: result.status });
}
