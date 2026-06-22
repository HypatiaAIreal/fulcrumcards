import { upsertCard } from "@/lib/cards";
import { validateCard } from "@/lib/card-schema";

/** Valida y guarda el par ES/EN de una card. Devuelve un resultado HTTP-friendly. */
export async function saveCardPair(
  esRaw: unknown,
  enRaw: unknown,
  expectedId?: string
): Promise<{ status: number; body: unknown }> {
  const ve = validateCard(esRaw);
  const vn = validateCard(enRaw);
  if (!ve.ok || !vn.ok) {
    return { status: 400, body: { error: "Card inválida", es: ve.errors, en: vn.errors } };
  }
  const es = ve.card!;
  const en = vn.card!;
  if (es.lang !== "es") return { status: 400, body: { error: 'La card "es" debe tener lang=es' } };
  if (en.lang !== "en") return { status: 400, body: { error: 'La card "en" debe tener lang=en' } };
  if (es.id !== en.id) return { status: 400, body: { error: "Los ids de es y en no coinciden" } };
  if (expectedId && es.id !== expectedId) {
    return { status: 400, body: { error: "El id del cuerpo no coincide con la ruta" } };
  }
  const status = es.status === "draft" ? "draft" : "published";
  es.status = status;
  en.status = status;
  await upsertCard(es);
  await upsertCard(en);
  return { status: 200, body: { ok: true, id: es.id, status } };
}
