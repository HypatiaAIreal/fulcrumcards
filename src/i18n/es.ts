// Diccionario ES — todos los textos de UI. La forma de este objeto define
// el tipo Dictionary; en.ts debe replicarla exactamente.
export const es = {
  meta: {
    titleDefault: "FulcrumCards — El Fulcro Invisible",
    titleTemplate: "%s · FulcrumCards",
    description:
      "Catálogo de cards diagnósticas del framework El Fulcro Invisible. Cada card diagnostica una profesión, empresa o caso a través de cuatro fulcros: material, epistémico, relacional y procedencia.",
    catalogTitle: "Catálogo",
  },
  brand: {
    book: "El Fulcro Invisible",
    mark: "El Fulcro Invisible · García Bach & Hypatia · 2026",
    authors: "García Bach & Hypatia · 2026",
  },
  nav: {
    catalogKicker: "El Fulcro Invisible · Catálogo",
    backToCatalog: "← Catálogo",
    card: "Card",
  },
  home: {
    leadPre: "Cards diagnósticas del framework ",
    leadPost:
      ". Diagnostica cualquier profesión a través de cuatro fulcros: material, epistémico, relacional y procedencia.",
    cta: "Ver catálogo →",
  },
  catalog: {
    title: "FulcrumCards",
    subtitlePre:
      "Cada card diagnostica una profesión, empresa o caso a través de cuatro fulcros — ",
    subtitleHighlight: "material, epistémico, relacional y procedencia",
    subtitlePost: (created: number, planned: number) =>
      `. ${created} de ${planned} publicadas.`,
    viewDiagnosis: "Ver diagnóstico →",
    underConstruction: (planned: number) =>
      `Catálogo en construcción · ${planned} cards`,
  },
  card: {
    diagnosis: "Diagnóstico de fulcros",
    verifiedCount: (n: number) => `${n} / 4 verificados`,
    visibleLever: "Palanca visible",
    invisibleFulcrum: "Fulcro invisible",
    contrast: "Contraste",
    escape: "¿Hay salida?",
    lesson: "Lección",
    ref: "Ref.",
    relatedCards: "Cards relacionadas",
  },
  fulcrums: {
    material: "Material",
    epistemic: "Epistémico",
    relational: "Relacional",
    provenance: "Procedencia",
  },
  status: {
    verified: "Verificado",
    assumed: "Asumido",
    absent: "Ausente",
  },
  severity: {
    strong: "Fulcros sólidos",
    mixed: "Diagnóstico mixto",
    warning: "Fulcros en riesgo",
    critical: "Fulcros en riesgo crítico",
    allVerified: "Cuatro fulcros verificados",
  },
  language: {
    switchAria: "Cambiar idioma",
    es: "ES",
    en: "EN",
  },
};
