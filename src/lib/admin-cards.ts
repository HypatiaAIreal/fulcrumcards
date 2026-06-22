import { validateCard } from "@/lib/card-schema";
import type { Card, VersionMeta } from "@/lib/cards";

export interface ParsedPair {
  es: Card;
  en: Card;
  meta: VersionMeta;
  publish: boolean;
}

/** Valida el cuerpo { es, en, meta?, publish? } de una operación de guardado. */
export function parsePairBody(body: unknown):
  | { error: string; details?: { es: string[]; en: string[] } }
  | { pair: ParsedPair } {
  const b = (body || {}) as Record<string, unknown>;
  const ve = validateCard(b.es);
  const vn = validateCard(b.en);
  if (!ve.ok || !vn.ok) {
    return { error: "Card inválida", details: { es: ve.errors, en: vn.errors } };
  }
  const es = ve.card!;
  const en = vn.card!;
  if (es.lang !== "es") return { error: 'La card "es" debe tener lang=es' };
  if (en.lang !== "en") return { error: 'La card "en" debe tener lang=en' };
  if (es.id !== en.id) return { error: "Los ids de es y en no coinciden" };

  const m = (b.meta || {}) as Record<string, unknown>;
  const meta: VersionMeta = {
    model: typeof m.model === "string" && m.model.trim() ? m.model.trim() : "manual",
    created_by:
      typeof m.created_by === "string" && m.created_by.trim()
        ? m.created_by.trim()
        : "carles",
    notes: typeof m.notes === "string" ? m.notes : "",
  };
  return { pair: { es, en, meta, publish: !!b.publish } };
}
