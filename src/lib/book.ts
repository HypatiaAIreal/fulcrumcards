/**
 * Datos del libro "El Fulcro Invisible" / "The Invisible Fulcrum".
 * Fuente: theinvisiblefulcrum.com/press. Una obra, dos ediciones (ES/EN).
 */
import type { Locale } from "@/lib/i18n";

export interface BookEdition {
  lang: Locale;
  title: string;
  subtitle: string;
  blurb: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  isbn: string;
  asin: string;
  buyUrl: string;
  price: string;
  store: string;
}

export const bookEditions: Record<Locale, BookEdition> = {
  es: {
    lang: "es",
    title: "El Fulcro Invisible",
    subtitle:
      "Cuando la IA puede hacerlo todo, lo que queda es dónde te apoyas",
    blurb:
      "Un marco para diagnosticar qué resiste a la automatización. Cuando la palanca —la capacidad de ejecutar— se vuelve commodity, lo único que no se puede regenerar es el fulcro: el punto de apoyo material, epistémico, relacional y de procedencia desde el que actúas.",
    cover: "/img/cover_fulcrum_ES.jpg",
    coverWidth: 1600,
    coverHeight: 2400,
    isbn: "978-84-09-87221-3",
    asin: "B0GZFH523G",
    buyUrl: "https://www.amazon.es/dp/B0GZFH523G",
    price: "9,99 €",
    store: "Amazon ES",
  },
  en: {
    lang: "en",
    title: "The Invisible Fulcrum",
    subtitle: "When AI can do everything, what's left is where you stand",
    blurb:
      "A framework for diagnosing what resists automation. When the lever — the capacity to execute — becomes a commodity, the one thing that cannot be regenerated is the fulcrum: the material, epistemic, relational and provenance ground you act from.",
    cover: "/img/cover_fulcrum_EN.jpg",
    coverWidth: 1600,
    coverHeight: 2400,
    isbn: "978-84-09-87220-6",
    asin: "B0H2JNTTKX",
    buyUrl: "https://www.amazon.com/dp/B0H2JNTTKX",
    price: "$9.99",
    store: "Amazon US",
  },
};

export const bookCommon = {
  authors: "Carles García Bach & Hypatia",
  publisher: "Harmony Nexus Vitae · Madrid",
  pages: 319,
  published: "2026",
  site: "https://theinvisiblefulcrum.com",
  tools: [
    { name: "FulcrumScan", url: "https://fulcrumscan.vercel.app" },
    { name: "FulcrumWatch", url: "https://fulcrumwatch.vercel.app" },
    { name: "FulcrumCheck", url: "https://fulcrum-check.vercel.app" },
  ],
};

/** El idioma "otro" respecto al actual. */
export function otherLocale(lang: Locale): Locale {
  return lang === "es" ? "en" : "es";
}
