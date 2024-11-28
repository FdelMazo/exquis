import { createClient } from "redis";

const CURRENT_CADAVER =
  process.env.NODE_ENV === "development" ? "dev-alpha" : "prod-alpha";

let db = null;
const start = async () => {
  if (db) {
    return db;
  }

  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  console.log("STARTING DB ON ", process.env.NODE_ENV, process.env.REDIS_URL);
  if (process.env.NODE_ENV === "production") {
    console.log("YES I AM HERE");
    await client.connect({
      url: process.env.REDIS_URL,
    });
  } else {
    console.log("NO I AM NOT HERE");
    await client.connect();
  }

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
