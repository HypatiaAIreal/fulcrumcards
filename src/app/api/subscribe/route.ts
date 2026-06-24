import { NextResponse } from "next/server";
import { addSubscriber, isValidEmail } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

/**
 * Suscripción pública (sin auth) a la notificación de una card "próximamente".
 * Body: { email, card_id }.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    card_id?: string;
  };
  const email = (body.email || "").trim();
  const cardId = (body.card_id || "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!cardId) {
    return NextResponse.json({ error: "missing_card" }, { status: 400 });
  }

  try {
    const created = await addSubscriber(email, cardId);
    return NextResponse.json({ ok: true, created });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
