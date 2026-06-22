/**
 * Capa de datos de FulcrumCards — respaldada por MongoDB (colección `fichas`).
 * Cada card es un documento con su campo `lang` ("es" | "en") y un `id` de 3 dígitos
 * compartido entre idiomas. Funciones públicas (catálogo) y de admin (CRUD).
 */
import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/mongodb";
import catalogData from "@/data/catalog.json";
import { defaultLocale, type Locale } from "@/lib/i18n";

export type FulcrumStatus = "verified" | "assumed" | "absent";
export type Severity = "strong" | "mixed" | "warning" | "critical";
export type CardStatus = "published" | "draft";

export interface Fulcrum {
  status: FulcrumStatus;
  detail: string;
  crack: string;
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
  /** Ausente = "published" (las 47 sembradas no lo llevan). */
  status?: CardStatus;
}

/** Metadatos del catálogo (orden y nombres bilingües de sectores). */
export const catalog = catalogData;

const NO_ID = { projection: { _id: 0 } } as const;

async function fichas() {
  return (await getDb()).collection<Card>("fichas");
}

/* ---------------------------------- Público --------------------------------- */

/** Cards publicadas de un idioma, ordenadas por id. */
export async function getAllCards(lang: Locale): Promise<Card[]> {
  noStore();
  const col = await fichas();
  return col
    .find({ lang, status: { $ne: "draft" } }, NO_ID)
    .sort({ id: 1 })
    .toArray();
}

export async function getCardById(
  lang: Locale,
  id: string
): Promise<Card | null> {
  noStore();
  const col = await fichas();
  return col.findOne({ lang, id, status: { $ne: "draft" } }, NO_ID);
}

/** Ids de cards publicadas (independientes del idioma). */
export async function getCardIds(): Promise<string[]> {
  const col = await fichas();
  const ids = await col.distinct("id", {
    lang: defaultLocale,
    status: { $ne: "draft" },
  });
  return ids.sort();
}

/* ----------------------------------- Admin ---------------------------------- */

export interface CardFilters {
  sector?: string;
  severity?: Severity;
  lang?: Locale;
  status?: CardStatus;
  q?: string;
}

/** Listado para el panel admin (incluye borradores), con filtros opcionales. */
export async function adminListCards(filters: CardFilters = {}): Promise<Card[]> {
  const col = await fichas();
  const query: Record<string, unknown> = {};
  if (filters.lang) query.lang = filters.lang;
  if (filters.sector) query.sector = filters.sector;
  if (filters.severity) query.severity = filters.severity;
  if (filters.status === "draft") query.status = "draft";
  else if (filters.status === "published") query.status = { $ne: "draft" };
  if (filters.q) query.title = { $regex: filters.q, $options: "i" };
  return col.find(query, NO_ID).sort({ id: 1, lang: 1 }).toArray();
}

/** Una card por id+idioma sin filtrar por estado (para editar). */
export async function adminGetCard(
  id: string,
  lang: Locale
): Promise<Card | null> {
  const col = await fichas();
  return col.findOne({ id, lang }, NO_ID);
}

/** Crea o reemplaza una card (clave id+lang). */
export async function upsertCard(card: Card): Promise<void> {
  const col = await fichas();
  await col.replaceOne({ id: card.id, lang: card.lang }, card, { upsert: true });
}

/** Elimina una card en todos los idiomas. */
export async function deleteCard(id: string): Promise<number> {
  const col = await fichas();
  const res = await col.deleteMany({ id });
  return res.deletedCount ?? 0;
}

/** Próximo id de 3 dígitos disponible (máximo + 1). */
export async function nextCardId(): Promise<string> {
  const col = await fichas();
  const ids = await col.distinct("id");
  const max = ids.reduce(
    (m: number, s: string) => Math.max(m, parseInt(s, 10) || 0),
    -1
  );
  return String(max + 1).padStart(3, "0");
}

/** Sectores conocidos (bilingües) para el selector del admin. */
export function listSectors(): { es: string; en: string }[] {
  return catalog.sectors.map((s) => s.name);
}
