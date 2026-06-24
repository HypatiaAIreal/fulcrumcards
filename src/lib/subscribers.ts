/**
 * Suscriptores de notificación de cards "próximamente".
 * Colección `subscribers`: { email, card_id, subscribed_at }.
 * Alimenta P4 del Fulcrum Experiment (75+ emails).
 */
import { getDb } from "@/lib/mongodb";

export interface Subscriber {
  email: string;
  card_id: string;
  subscribed_at: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Guarda un suscriptor. Idempotente por (email, card_id): si ya está, no duplica.
 * Devuelve true si es nuevo, false si ya existía.
 */
export async function addSubscriber(email: string, cardId: string): Promise<boolean> {
  const db = await getDb();
  const col = db.collection<Subscriber>("subscribers");
  const normalized = email.trim().toLowerCase();
  const r = await col.updateOne(
    { email: normalized, card_id: cardId },
    { $setOnInsert: { email: normalized, card_id: cardId, subscribed_at: new Date().toISOString() } },
    { upsert: true }
  );
  return (r.upsertedCount ?? 0) > 0;
}
