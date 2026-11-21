import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * One cached Mongoose connection for the whole process.
 *
 * Express is long-lived, so the cache mostly protects us from double connects
 * (seed script, nodemon restarts, future test helpers) and gives every caller
 * the same promise instead of a stamped of parallel handshakes to Atlas.
 */

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
  minPoolSize: 1,
  // Fail fast instead of buffering queries for 10s when Atlas is unreachable.
  bufferCommands: false,
};

const cache = (globalThis.__studiospaceDb ??= { connection: null, promise: null });

const STATE_LABELS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

let eventsBound = false;

function bindConnectionEvents() {
  if (eventsBound) return;
  eventsBound = true;

  const { connection } = mongoose;

  connection.on("connected", () => {
    console.log(`[db] connected to ${connection.host}/${connection.name}`);
  });
  connection.on("disconnected", () => {
    console.warn("[db] connection lost; the driver will retry on its own");
  });
  connection.on("error", (error) => {
    console.error(`[db] connection error: ${error.message}`);
  });
}

export async function connectDB() {
  bindConnectionEvents();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongodbUri, CONNECT_OPTIONS);
  }

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    // Clear the rejected promise so a later retry can actually try again.
    cache.promise = null;
    throw new Error(`[db] could not reach MongoDB: ${error.message}`);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) return;

  await mongoose.disconnect();
  cache.connection = null;
  cache.promise = null;
  console.log("[db] disconnected");
}

export function getDbState() {
  return STATE_LABELS[mongoose.connection.readyState] ?? "unknown";
}
