/**
 * Configuración visual compartida del diagnóstico de fulcros.
 * Fuente única de verdad para colores/etiquetas usada tanto por
 * <FulcrumCard /> como por las previews del catálogo.
 * Los colores referencian las variables CSS de globals.css.
 */
import type { Card, FulcrumStatus, Severity } from "./cards";

export interface SeverityMeta {
  label: string;
  color: string;
  bg: string;
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  strong: { label: "Fulcros sólidos", color: "var(--verified)", bg: "var(--verified-bg)" },
  mixed: { label: "Diagnóstico mixto", color: "var(--assumed)", bg: "var(--assumed-bg)" },
  warning: { label: "Fulcros en riesgo", color: "var(--warning)", bg: "var(--warning-bg)" },
  critical: { label: "Fulcros en riesgo crítico", color: "var(--absent)", bg: "var(--absent-bg)" },
};

export const STATUS_META: Record<FulcrumStatus, { label: string; glyph: string }> = {
  verified: { label: "Verificado", glyph: "✓" },
  assumed: { label: "Asumido", glyph: "~" },
  absent: { label: "Ausente", glyph: "✕" },
};

/** Orden canónico de los cuatro fulcros y su nombre visible. */
export const FULCRUM_ORDER = [
  { key: "material", name: "Material" },
  { key: "epistemic", name: "Epistémico" },
  { key: "relational", name: "Relacional" },
  { key: "provenance", name: "Procedencia" },
] as const;

/** Color CSS asociado al estado de un fulcro (para puntos y barras inline). */
export function statusColor(status: FulcrumStatus): string {
  if (status === "verified") return "var(--verified)";
  if (status === "assumed") return "var(--assumed)";
  return "var(--absent)";
}

export function countVerified(card: Card): number {
  return Object.values(card.fulcrums).filter((f) => f.status === "verified").length;
}

/**
 * Texto del badge de severidad. Si los cuatro fulcros están verificados
 * usa el literal del template ("Cuatro fulcros verificados"); si no,
 * la etiqueta de severidad correspondiente.
 */
export function severityBadgeText(card: Card): string {
  const allVerified = Object.values(card.fulcrums).every((f) => f.status === "verified");
  return allVerified ? "Cuatro fulcros verificados" : SEVERITY_META[card.severity].label;
}
