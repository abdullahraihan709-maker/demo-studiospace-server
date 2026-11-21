import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createApp } from "./app.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
  // Connect before listening: a server that answers /health while Mongo is
  // unreachable is more dangerous than one that never comes up.
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[boot] StudioSpace API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  server.on("error", (error) => {
    console.error(`[boot] HTTP server error: ${error.message}`);
    process.exit(1);
  });

  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[boot] ${signal} received, shutting down`);

    const forceExit = setTimeout(() => {
      console.error("[boot] shutdown timed out; forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(async () => {
      try {
        await disconnectDB();
      } finally {
        clearTimeout(forceExit);
        process.exit(0);
      }
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error(`[boot] failed: ${error.message}`);
  process.exit(1);
});
