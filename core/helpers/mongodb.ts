import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI no está definida en el archivo .env");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Para evitar múltiples conexiones en modo dev
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client
    .connect()
    .then((c) => {
      console.log("✅ MongoDB conectado correctamente.");
      return c;
    })
    .catch((err) => {
      console.error("❌ Error al conectar a MongoDB:", err);
      throw err;
    });
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
