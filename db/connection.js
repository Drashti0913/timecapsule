import { MongoClient } from "mongodb";

if (!process.env.MONGO_URL) {
  throw new Error(
    "MONGO_URL is not set. Copy .env.example to .env and fill it in.",
  );
}

const client = new MongoClient(process.env.MONGO_URL);
let db;

export async function connectDB() {
  await client.connect();
  db = client.db("timecapsule");
  await db.collection("capsules").createIndex({ ownerId: 1, unlockAt: 1 });
  await db
    .collection("memories")
    .createIndex({ placeLower: 1, year: 1, season: 1 });
  console.log("Connected to MongoDB");
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected yet");
  return db;
}

export async function closeDB() {
  await client.close();
}
