/**
 * Lógica visual del diagnóstico de fulcros (colores, glifos, claves).
 * Los textos legibles viven en los diccionarios i18n (src/i18n/*).
 * Fuente única de verdad usada por <FulcrumCard /> y las previews del catálogo.
 */
import type { Card, FulcrumStatus, Severity } from "./cards";

export const SEVERITY_STYLE: Record<Severity, { color: string; bg: string }> = {
  strong: { color: "var(--verified)", bg: "var(--verified-bg)" },
  mixed: { color: "var(--assumed)", bg: "var(--assumed-bg)" },
  warning: { color: "var(--warning)", bg: "var(--warning-bg)" },
  critical: { color: "var(--absent)", bg: "var(--absent-bg)" },
};

export const STATUS_GLYPH: Record<FulcrumStatus, string> = {
  verified: "✓",
  assumed: "~",
  absent: "✕",
};

/** Claves de los cuatro fulcros en orden canónico de renderizado. */
export const FULCRUM_KEYS = [
  "material",
  "epistemic",
  "relational",
  "provenance",
] as const;
export type FulcrumKey = (typeof FULCRUM_KEYS)[number];

export function statusColor(status: FulcrumStatus): string {
  if (status === "verified") return "var(--verified)";
  if (status === "assumed") return "var(--assumed)";
  return "var(--absent)";
}

export function countVerified(card: Card): number {
  return Object.values(card.fulcrums).filter((f) => f.status === "verified")
    .length;
}

export function isAllVerified(card: Card): boolean {
  return Object.values(card.fulcrums).every((f) => f.status === "verified");
}
