// Migración del sistema de visibilidad: marca TODAS las cards existentes como
// "teaser" (visibles pero bloqueadas). El usuario irá activando las que quiera
// como "public" desde el admin. Crea también el índice de visibilidad.
// Uso: node --env-file=.env scripts/migrate-visibility.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Falta MONGODB_URI"); process.exit(1); }

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const col = client.db("fulcrumcards").collection("fichas");

// Todas las cards existentes → teaser (visible pero bloqueada).
const r = await col.updateMany({}, { $set: { visibility: "teaser" } });

// Índice para el filtrado del catálogo público.
await col.createIndex({ status: 1, lang: 1, visibility: 1 });

const total = await col.countDocuments();
const byVis = await col
  .aggregate([{ $group: { _id: "$visibility", n: { $sum: 1 } } }, { $sort: { _id: 1 } }])
  .toArray();
console.log(`Docs: ${total}. Modificados: ${r.modifiedCount}.`);
console.log("Por visibilidad:", JSON.stringify(byVis));

await client.close();
