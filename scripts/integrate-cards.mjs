// Integra un lote de cards generado por el workflow.
// Uso: node scripts/integrate-cards.mjs <ruta-al-output-del-workflow>
//
// - Escribe src/data/cards/{es,en}/card_<id>.json desde result.cards[].{es,en}
// - Regenera src/data/cards/index.ts (imports + arrays) escaneando los directorios
// - Marca como "created" en catalog.json los ids escritos y recalcula total_created
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2];
if (!OUT) {
  console.error("Falta la ruta al output del workflow.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(OUT, "utf8"));
const cards = (data.result && data.result.cards) || [];

const esDir = path.join(ROOT, "src/data/cards/es");
const enDir = path.join(ROOT, "src/data/cards/en");
fs.mkdirSync(esDir, { recursive: true });
fs.mkdirSync(enDir, { recursive: true });

const written = [];
for (const c of cards) {
  if (!c || !c.es || !c.en) {
    console.warn("Card incompleta, se omite:", c && c.id);
    continue;
  }
  const id = c.es.id;
  fs.writeFileSync(
    path.join(esDir, `card_${id}.json`),
    JSON.stringify(c.es, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(enDir, `card_${id}.json`),
    JSON.stringify(c.en, null, 2) + "\n"
  );
  written.push(id);
}

// Regenera el índice escaneando ambos directorios.
const scan = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => /^card_\d+\.json$/.test(f))
    .sort();
const idOf = (f) => f.match(/card_(\d+)\.json/)[1];

const esFiles = scan(esDir);
const enFiles = scan(enDir);

const lines = [
  "// AUTO-GENERADO por scripts/integrate-cards.mjs. No editar a mano.",
  "",
  ...esFiles.map((f) => `import esCard${idOf(f)} from "./es/${f}";`),
  ...enFiles.map((f) => `import enCard${idOf(f)} from "./en/${f}";`),
  "",
  `export const cardsEs = [${esFiles.map((f) => `esCard${idOf(f)}`).join(", ")}];`,
  `export const cardsEn = [${enFiles.map((f) => `enCard${idOf(f)}`).join(", ")}];`,
  "",
];
fs.writeFileSync(path.join(ROOT, "src/data/cards/index.ts"), lines.join("\n"));

// Actualiza el catálogo.
const catalogPath = path.join(ROOT, "src/data/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const createdIds = new Set();
for (const sector of catalog.sectors) {
  for (const card of sector.cards) {
    if (written.includes(card.id)) card.status = "created";
    if (card.status === "created") createdIds.add(card.id);
  }
}
catalog.total_created = createdIds.size;
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");

console.log("Cards escritas:", written.join(", "));
console.log("Total es/en en índice:", esFiles.length, "/", enFiles.length);
console.log("total_created:", catalog.total_created);
