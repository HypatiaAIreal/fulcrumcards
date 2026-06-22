// Siembra MongoDB (colección `fichas`) con las cards JSON de src/data/cards/{es,en}.
// Uso: node --env-file=.env scripts/seed-mongo.mjs
//   (o MONGODB_URI=... node scripts/seed-mongo.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_NAME = "fulcrumcards";
const COLLECTION = "fichas";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Falta MONGODB_URI");
  process.exit(1);
}

function loadLang(lang) {
  const dir = path.join(ROOT, "src/data/cards", lang);
  return fs
    .readdirSync(dir)
    .filter((f) => /^card_\d+\.json$/.test(f))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

const docs = [...loadLang("es"), ...loadLang("en")];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const col = client.db(DB_NAME).collection(COLLECTION);

// Clave única por (id, lang).
await col.createIndex({ id: 1, lang: 1 }, { unique: true });

let upserts = 0;
for (const doc of docs) {
  const res = await col.replaceOne({ id: doc.id, lang: doc.lang }, doc, {
    upsert: true,
  });
  if (res.upsertedCount || res.modifiedCount) upserts++;
}

const total = await col.countDocuments();
const es = await col.countDocuments({ lang: "es" });
const en = await col.countDocuments({ lang: "en" });
console.log(`Sembradas ${docs.length} cards. Upserts: ${upserts}.`);
console.log(`Total en fichas: ${total} (es=${es}, en=${en}).`);

await client.close();
