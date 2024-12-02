import { createClient } from "redis";

const CURRENT_CADAVER =
  process.env.NODE_ENV === "development" ? "dev-alpha" : "prod-beta";

let db = null;
const start = async () => {
  if (db) {
    return db;
  }

  const client =
    process.env.NODE_ENV === "production"
      ? createClient({
          url: process.env.REDIS_URL,
        })
      : createClient();

  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  db = client;
  return db;
};

export const getSentences = async () => {
  const db = await start();

  // TODO: use SCAN
  const keys = (await db.KEYS(`cadaver-${CURRENT_CADAVER}:*`)).sort((a, b) => {
    const timestampA = a.split(":")[1].replace(/;/g, ":");
    const timestampB = b.split(":")[1].replace(/;/g, ":");
    return new Date(timestampA) - new Date(timestampB);
  });

  // TODO: avoid multiple DB calls
  const sentences = await Promise.all(
    keys.map(async (key) => {
      const value = await db.HGETALL(key);
      return value.sentence;
    })
  );

  return sentences;
};

export const appendSentence = async (sentence) => {
  const db = await start();
  const timestamp = new Date().toISOString().replace(/:/g, ";");

  await db.HSET(
    `cadaver-${CURRENT_CADAVER}:${timestamp}`,
    "sentence",
    sentence
  );
};
