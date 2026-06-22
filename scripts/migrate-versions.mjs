// Migración al sistema de versiones: añade metadata de versión a los documentos
// existentes y reemplaza el índice único (id,lang) por (id,lang,version).
// Uso: node --env-file=.env scripts/migrate-versions.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Falta MONGODB_URI"); process.exit(1); }

const OPUS = ["000", "003", "021"];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const col = client.db("fulcrumcards").collection("fichas");

// 1) Todos -> version 1, status published (son la versión publicada actual).
await col.updateMany({}, { $set: { version: 1, status: "published" } });

// 2) Metadata por origen.
const opus = await col.updateMany(
  { id: { $in: OPUS } },
  { $set: { model: "claude-opus-4-6", created_by: "hypatia-opus-4.6", notes: "Diseñada en conversación Carles-Hypatia" } }
);
const sonnet = await col.updateMany(
  { id: { $nin: OPUS } },
  { $set: { model: "claude-sonnet-4-6", created_by: "claude-sonnet-4.6", notes: "Generada por pipeline automático" } }
);

// 3) Índices: (id,lang) ya no es único; clave única = (id,lang,version).
const idx = await col.indexes();
if (idx.find((i) => i.name === "id_1_lang_1")) {
  await col.dropIndex("id_1_lang_1");
  console.log("Índice id_1_lang_1 eliminado.");
}
await col.createIndex({ id: 1, lang: 1, version: 1 }, { unique: true });
await col.createIndex({ status: 1, lang: 1 });

const total = await col.countDocuments();
const pub = await col.countDocuments({ status: "published" });
const sample = await col.findOne({ id: "021", lang: "es" }, { projection: { _id: 0, id: 1, version: 1, status: 1, model: 1, created_by: 1, notes: 1 } });
console.log(`Docs: ${total}, publicados: ${pub}. Opus: ${opus.modifiedCount}, Sonnet: ${sonnet.modifiedCount}.`);
console.log("Ejemplo #021:", JSON.stringify(sample));

await client.close();
