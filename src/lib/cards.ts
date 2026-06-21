/**
 * Capa de datos de FulcrumCards.
 * Por ahora la fuente de verdad son los JSON de src/data/cards/{es,en}/.
 * MongoDB (colección `fichas`, con campo lang) sustituirá estos imports más
 * adelante manteniendo la misma interfaz pública.
 */
import { cardsEs, cardsEn } from "@/data/cards/index";
import catalogData from "@/data/catalog.json";
import { defaultLocale, type Locale } from "@/lib/i18n";

export type FulcrumStatus = "verified" | "assumed" | "absent";
export type Severity = "strong" | "mixed" | "warning" | "critical";

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
  opening: string;
  fulcrums: {
    material: Fulcrum;
    epistemic: Fulcrum;
    relational: Fulcrum;
    provenance: Fulcrum;
  };
  lever: string;
  fulcrum: string;
  contrast: CardContrast;
  escape: string | null;
  lesson: string;
  references: string[];
  url: string;
  created_at: string;
  lang: string;
}

const cardsByLang = {
  es: cardsEs,
  en: cardsEn,
} as unknown as Record<Locale, Card[]>;

// Validación ligera (solo en desarrollo): cada barra debe tener 4 valores en {0, 0.5, 1}.
if (process.env.NODE_ENV !== "production") {
  for (const [lang, list] of Object.entries(cardsByLang)) {
    for (const card of list) {
      for (const [key, f] of Object.entries(card.fulcrums)) {
        const valid =
          f.bar.length === 4 && f.bar.every((v) => v === 0 || v === 0.5 || v === 1);
        if (!valid) {
          console.warn(
            `[FulcrumCards] (${lang}) Card #${card.id} · fulcro "${key}": bar inválido`,
            f.bar
          );
        }
      }
    }
  }
}

/** Catálogo completo bilingüe (creadas + planificadas) para la vista de overview. */
export const catalog = catalogData;

/** Cards creadas en un idioma, ordenadas por id ascendente. */
export function getAllCards(lang: Locale): Card[] {
  const list = cardsByLang[lang] ?? cardsByLang[defaultLocale];
  return [...list].sort((a, b) => a.id.localeCompare(b.id));
}

export function getCardById(lang: Locale, id: string): Card | undefined {
  return (cardsByLang[lang] ?? cardsByLang[defaultLocale]).find(
    (card) => card.id === id
  );
}

/** Ids de cards (independientes del idioma). */
export function getCardIds(): string[] {
  return cardsByLang[defaultLocale].map((card) => card.id);
}
