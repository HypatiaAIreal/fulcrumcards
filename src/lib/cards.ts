/**
 * Capa de datos de FulcrumCards — MongoDB (colección `fichas`).
 * Sistema de versiones: cada documento es (id, lang, version). Una sola
 * versión por id está "published" a la vez; las demás quedan "draft"/"archived".
 * El catálogo público muestra siempre la versión publicada.
 */
import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/mongodb";
import catalogData from "@/data/catalog.json";
import { defaultLocale, type Locale } from "@/lib/i18n";

export type FulcrumStatus = "verified" | "assumed" | "absent";
export type Severity = "strong" | "mixed" | "warning" | "critical";
export type CardStatus = "published" | "draft" | "archived";

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
  // --- metadata de versión ---
  version?: number;
  status?: CardStatus;
  model?: string;
  created_by?: string;
  notes?: string;
}

export interface VersionMeta {
  model: string;
  created_by: string;
  notes: string;
  created_at?: string;
}

/** Resumen de una versión (para el panel de versiones). */
export interface VersionSummary {
  version: number;
  status: CardStatus;
  model: string;
  created_by: string;
  notes: string;
  created_at: string;
  title: string;
  langs: string[];
}

/** Metadatos del catálogo (orden y nombres bilingües de sectores). */
export const catalog = catalogData;

const NO_ID = { projection: { _id: 0 } } as const;

async function fichas() {
  return (await getDb()).collection<Card>("fichas");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------------------------- Público --------------------------------- */

export async function getAllCards(lang: Locale): Promise<Card[]> {
  noStore();
  const col = await fichas();
  return col.find({ lang, status: "published" }, NO_ID).sort({ id: 1 }).toArray();
}

export async function getCardById(lang: Locale, id: string): Promise<Card | null> {
  noStore();
  const col = await fichas();
  return col.findOne({ lang, id, status: "published" }, NO_ID);
}

export async function getCardIds(): Promise<string[]> {
  const col = await fichas();
  const ids = await col.distinct("id", { lang: defaultLocale, status: "published" });
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

export type AdminCardRow = Card & { _versions: number };

/** Una fila por id: la versión representativa (publicada > draft > archivada). */
export async function adminListCards(filters: CardFilters = {}): Promise<AdminCardRow[]> {
  const col = await fichas();
  const match: Record<string, unknown> = { lang: filters.lang || defaultLocale };
  if (filters.sector) match.sector = filters.sector;
  if (filters.severity) match.severity = filters.severity;
  if (filters.q) match.title = { $regex: filters.q, $options: "i" };

  const pipeline: object[] = [
    { $match: match },
    {
      $addFields: {
        _rank: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "published"] }, then: 2 },
              { case: { $eq: ["$status", "draft"] }, then: 1 },
            ],
            default: 0,
          },
        },
      },
    },
    { $sort: { _rank: -1, version: -1 } },
    { $group: { _id: "$id", doc: { $first: "$$ROOT" }, versions: { $sum: 1 } } },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { _versions: "$versions" }] } } },
  ];
  if (filters.status) pipeline.push({ $match: { status: filters.status } });
  pipeline.push({ $project: { _id: 0, _rank: 0 } }, { $sort: { id: 1 } });

  return col.aggregate<AdminCardRow>(pipeline).toArray();
}

/** Todas las versiones de un id (resumen, más reciente primero). */
export async function adminListVersions(id: string): Promise<VersionSummary[]> {
  const col = await fichas();
  const docs = await col
    .find({ id }, { projection: { _id: 0 } })
    .sort({ version: -1 })
    .toArray();
  const byVersion = new Map<number, VersionSummary>();
  for (const d of docs) {
    const v = d.version ?? 1;
    if (!byVersion.has(v)) {
      byVersion.set(v, {
        version: v,
        status: (d.status as CardStatus) ?? "published",
        model: d.model ?? "",
        created_by: d.created_by ?? "",
        notes: d.notes ?? "",
        created_at: d.created_at ?? "",
        title: d.lang === "es" ? d.title : d.title,
        langs: [],
      });
    }
    const s = byVersion.get(v)!;
    if (d.lang === "es") s.title = d.title; // preferimos el título ES
    if (!s.langs.includes(d.lang)) s.langs.push(d.lang);
  }
  return [...byVersion.values()].sort((a, b) => b.version - a.version);
}

export async function adminGetCard(
  id: string,
  lang: Locale,
  version?: number
): Promise<Card | null> {
  const col = await fichas();
  if (version) return col.findOne({ id, lang, version }, NO_ID);
  const published = await col.findOne({ id, lang, status: "published" }, NO_ID);
  if (published) return published;
  return col.find({ id, lang }, NO_ID).sort({ version: -1 }).limit(1).next();
}

async function nextVersion(id: string): Promise<number> {
  const col = await fichas();
  const versions = (await col.distinct("version", { id })) as (number | undefined)[];
  const max = versions.reduce<number>((m, v) => Math.max(m, v || 0), 0);
  return max + 1;
}

export async function nextCardId(): Promise<string> {
  const col = await fichas();
  const ids = await col.distinct("id");
  const max = ids.reduce((m: number, s: string) => Math.max(m, parseInt(s, 10) || 0), -1);
  return String(max + 1).padStart(3, "0");
}

function applyMeta(card: Card, id: string, lang: Locale, version: number, status: CardStatus, meta: VersionMeta) {
  card.id = id;
  card.lang = lang;
  card.version = version;
  card.status = status;
  card.model = meta.model;
  card.created_by = meta.created_by;
  card.notes = meta.notes;
  card.created_at = meta.created_at || card.created_at || today();
}

async function archiveOthers(id: string, exceptVersion: number) {
  const col = await fichas();
  await col.updateMany(
    { id, version: { $ne: exceptVersion }, status: "published" },
    { $set: { status: "archived" } }
  );
}

async function writePair(id: string, version: number, status: CardStatus, es: Card, en: Card, meta: VersionMeta) {
  const col = await fichas();
  applyMeta(es, id, "es", version, status, meta);
  applyMeta(en, id, "en", version, status, meta);
  await col.replaceOne({ id, lang: "es", version }, es, { upsert: true });
  await col.replaceOne({ id, lang: "en", version }, en, { upsert: true });
  if (status === "published") await archiveOthers(id, version);
}

/** Crea la versión 1 de una card con el id que trae la propia card. */
export async function createCard(es: Card, en: Card, meta: VersionMeta, publish: boolean): Promise<string> {
  const id = es.id;
  await writePair(id, 1, publish ? "published" : "draft", es, en, { ...meta, created_at: today() });
  return id;
}

/** Añade una versión nueva a un id existente. */
export async function addVersion(id: string, es: Card, en: Card, meta: VersionMeta, publish: boolean): Promise<number> {
  const version = await nextVersion(id);
  await writePair(id, version, publish ? "published" : "draft", es, en, { ...meta, created_at: today() });
  return version;
}

/** Actualiza el contenido/metadata de una versión concreta. */
export async function updateVersion(
  id: string,
  version: number,
  es: Card,
  en: Card,
  meta: VersionMeta,
  publish: boolean
): Promise<void> {
  await writePair(id, version, publish ? "published" : "draft", es, en, meta);
}

/** Publica una versión y archiva las demás. */
export async function publishVersion(id: string, version: number): Promise<void> {
  const col = await fichas();
  await archiveOthers(id, version);
  await col.updateMany({ id, version }, { $set: { status: "published" } });
}

/** Elimina una versión (ambos idiomas). */
export async function deleteVersion(id: string, version: number): Promise<number> {
  const col = await fichas();
  const r = await col.deleteMany({ id, version });
  return r.deletedCount ?? 0;
}

/** Elimina la card entera (todas las versiones, todos los idiomas). */
export async function deleteCard(id: string): Promise<number> {
  const col = await fichas();
  const r = await col.deleteMany({ id });
  return r.deletedCount ?? 0;
}

export function listSectors(): { es: string; en: string }[] {
  return catalog.sectors.map((s) => s.name);
}
