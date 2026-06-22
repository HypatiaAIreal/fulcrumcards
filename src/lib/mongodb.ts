import { MongoClient, type Db } from "mongodb";

const DB_NAME = "fulcrumcards";

// Reutiliza la conexión entre invocaciones (dev hot-reload y serverless).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  return (await clientPromise()).db(DB_NAME);
}
