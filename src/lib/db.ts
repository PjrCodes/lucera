// This module handles the MongoDB connection.
// It follows the recommended approach from Vercel for Next.js applications.
import { MongoClient, ServerApiVersion } from "mongodb";

// The MONGODB_URI environment variable is required to connect to the database.
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;

// In development, a global variable is used to preserve the client
// across hot-reloads. This prevents creating a new connection on every change.
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // eslint-disable-next-line prefer-const
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  // In production, a new client is created for each server instance.
  client = new MongoClient(uri, options);
}

// Export a module-scoped MongoClient to be shared across the application.
export default client;
