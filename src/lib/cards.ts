/**
 * Capa de datos de FulcrumCards.
 * Por ahora la fuente de verdad son los JSON de src/data/cards/.
 * MongoDB (colección `fichas`) sustituirá estos imports más adelante,
 * manteniendo la misma interfaz pública (getAllCards / getCardById / getCardIds).
 */
import card000 from "@/data/cards/card_000.json";
import card003 from "@/data/cards/card_003.json";
import card021 from "@/data/cards/card_021.json";
import catalogData from "@/data/catalog.json";

export type FulcrumStatus = "verified" | "assumed" | "absent";
export type Severity = "strong" | "mixed" | "warning" | "critical";

/** Un fulcro individual: estado, detalle, grieta y barra de 4 segmentos. */
export interface Fulcrum {
  status: FulcrumStatus;
  detail: string;
  /** "Grieta": punto débil del fulcro. Puede estar vacío. */
  crack: string;
  /** 4 valores: 1 = verified, 0.5 = assumed, 0 = absent. */
  bar: number[];
}

export interface CardContrast {
  card_ref: string;
  text: string;
}

export interface Card {
  id: string;
  title: string;
  sector: string;
  severity: Severity;
  subtitle: string;
  /** Micro-relato que abre con persona, no con concepto. */
  opening: string;
  fulcrums: {
    material: Fulcrum;
    epistemic: Fulcrum;
    relational: Fulcrum;
    provenance: Fulcrum;
  };
  /** Palanca visible. */
  lever: string;
  /** Fulcro invisible. */
  fulcrum: string;
  contrast: CardContrast;
  /** "¿Hay salida?" — sólo en cards warning/critical; null si no aplica. */
  escape: string | null;
  lesson: string;
  references: string[];
  url: string;
  created_at: string;
  lang: string;
}

const cards = [card000, card003, card021] as unknown as Card[];

// Validación ligera (solo en desarrollo): avisa de barras malformadas mientras
// las cards se escriben a mano en JSON. Cada barra debe tener 4 valores en {0, 0.5, 1}.
if (process.env.NODE_ENV !== "production") {
  for (const card of cards) {
    for (const [key, f] of Object.entries(card.fulcrums)) {
      const valid =
        f.bar.length === 4 && f.bar.every((v) => v === 0 || v === 0.5 || v === 1);
      if (!valid) {
        console.warn(
          `[FulcrumCards] Card #${card.id} · fulcro "${key}": bar inválido`,
          f.bar
        );
      }
    }
  }
}

/** Catálogo completo (creadas + planificadas) para la vista de overview. */
export const catalog = catalogData;

/** Todas las cards creadas, ordenadas por id ascendente. */
export function getAllCards(): Card[] {
  return [...cards].sort((a, b) => a.id.localeCompare(b.id));
}

export function getCardById(id: string): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function getCardIds(): string[] {
  return cards.map((card) => card.id);
}
