// English dictionary — must mirror the shape of es.ts (enforced in lib/i18n.ts).
export const en = {
  meta: {
    titleDefault: "FulcrumCards — The Invisible Fulcrum",
    titleTemplate: "%s · FulcrumCards",
    description:
      "Catalog of diagnostic cards from The Invisible Fulcrum framework. Each card diagnoses a profession, company or case through four fulcrums: material, epistemic, relational and provenance.",
    catalogTitle: "Catalog",
  },
  brand: {
    book: "The Invisible Fulcrum",
    mark: "The Invisible Fulcrum · García Bach & Hypatia · 2026",
    authors: "García Bach & Hypatia · 2026",
  },
  nav: {
    catalogKicker: "The Invisible Fulcrum · Catalog",
    backToCatalog: "← Catalog",
    card: "Card",
    catalog: "Catalog",
    book: "The book",
  },
  book: {
    kicker: "The book",
    by: "By",
    buyOn: (store: string) => `Buy on ${store}`,
    isbn: "ISBN",
    publisher: "Publisher",
    pages: "Pages",
    published: "Published",
    otherEdition: "Also available in Spanish →",
    ecosystem: "Ecosystem",
    vol2: "Volume 2 in preparation",
    visitSite: "theinvisiblefulcrum.com →",
  },
  home: {
    leadPre: "Diagnostic cards from the ",
    leadPost:
      " framework. Diagnose any profession through four fulcrums: material, epistemic, relational and provenance.",
    cta: "View catalog →",
  },
  catalog: {
    title: "FulcrumCards",
    subtitlePre:
      "Each card diagnoses a profession, company or case through four fulcrums — ",
    subtitleHighlight: "material, epistemic, relational and provenance",
    subtitlePost: (created: number, planned: number) =>
      `. ${created} of ${planned} published.`,
    viewDiagnosis: "View diagnosis →",
    underConstruction: (planned: number) =>
      `Catalog under construction · ${planned} cards`,
  },
  card: {
    diagnosis: "Fulcrum diagnosis",
    verifiedCount: (n: number) => `${n} / 4 verified`,
    visibleLever: "Visible lever",
    invisibleFulcrum: "Invisible fulcrum",
    contrast: "Contrast",
    escape: "Is there a way out?",
    lesson: "Lesson",
    ref: "Ref.",
    relatedCards: "Related cards",
  },
  fulcrums: {
    material: "Material",
    epistemic: "Epistemic",
    relational: "Relational",
    provenance: "Provenance",
  },
  status: {
    verified: "Verified",
    assumed: "Assumed",
    absent: "Absent",
  },
  severity: {
    strong: "Solid fulcrums",
    mixed: "Mixed diagnosis",
    warning: "Fulcrums at risk",
    critical: "Fulcrums at critical risk",
    allVerified: "Four verified fulcrums",
  },
  language: {
    switchAria: "Switch language",
    es: "ES",
    en: "EN",
  },
};
