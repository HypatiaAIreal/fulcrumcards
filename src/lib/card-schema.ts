// Validación ligera de una card antes de guardarla en la base de datos.
import type { Card } from "@/lib/cards";

const SEVERITIES = ["strong", "mixed", "warning", "critical"];
const STATUSES = ["verified", "assumed", "absent"];
const FULCRUM_KEYS = ["material", "epistemic", "relational", "provenance"];

export function validateCard(obj: unknown): { ok: boolean; errors: string[]; card?: Card } {
  const errors: string[] = [];
  const c = obj as Record<string, unknown>;
  if (!c || typeof c !== "object") return { ok: false, errors: ["No es un objeto"] };

  const str = (k: string) => {
    if (typeof c[k] !== "string" || !(c[k] as string).trim()) errors.push(`Campo "${k}" requerido (string)`);
  };
  ["id", "title", "sector", "subtitle", "opening", "lever", "fulcrum", "lesson", "url", "created_at", "lang"].forEach(str);

  if (!SEVERITIES.includes(c.severity as string)) errors.push(`severity inválido (${SEVERITIES.join("|")})`);
  if (c.lang !== "es" && c.lang !== "en") errors.push('lang debe ser "es" o "en"');
  if (
    c.status !== undefined &&
    !["published", "draft", "archived"].includes(c.status as string)
  )
    errors.push('status debe ser "published", "draft" o "archived"');

  const f = c.fulcrums as Record<string, Record<string, unknown>> | undefined;
  if (!f || typeof f !== "object") {
    errors.push("fulcrums requerido");
  } else {
    for (const key of FULCRUM_KEYS) {
      const fk = f[key];
      if (!fk) { errors.push(`fulcrums.${key} requerido`); continue; }
      if (!STATUSES.includes(fk.status as string)) errors.push(`fulcrums.${key}.status inválido`);
      if (typeof fk.detail !== "string") errors.push(`fulcrums.${key}.detail requerido`);
      if (typeof fk.crack !== "string") errors.push(`fulcrums.${key}.crack requerido`);
      const bar = fk.bar as unknown[];
      if (!Array.isArray(bar) || bar.length !== 4 || !bar.every((v) => v === 0 || v === 0.5 || v === 1))
        errors.push(`fulcrums.${key}.bar debe ser 4 valores en {0, 0.5, 1}`);
    }
  }

  const contrast = c.contrast as Record<string, unknown> | undefined;
  if (!contrast || typeof contrast.card_ref !== "string" || typeof contrast.text !== "string")
    errors.push("contrast.{card_ref,text} requerido");

  if (c.escape !== null && typeof c.escape !== "string") errors.push("escape debe ser string o null");
  if (!Array.isArray(c.references) || !(c.references as unknown[]).every((r) => typeof r === "string"))
    errors.push("references debe ser un array de strings");

  return errors.length ? { ok: false, errors } : { ok: true, errors: [], card: c as unknown as Card };
}
