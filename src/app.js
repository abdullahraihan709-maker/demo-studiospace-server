import express from "express";
import { env } from "./config/env.js";
import { getDbState } from "./config/db.js";
import { applySecurity } from "./config/security.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

/**
 * Builds the Express app without listening.
 * Keeping construction separate from boot lets the seed/health tools and any
 * future integration test import the same stack the server actually runs.
 */
export function createApp() {
  const app = express();

  applySecurity(app);

  /**
   * Health probe. Also used by Render's health check and by a cron ping
   * to keep the free-tier instance warm.
   */
  app.get(["/health", "/api/health"], (req, res) => {
    res.json({
      ok: true,
      service: "studiospace-api",
      db: getDbState(),
      uptime: Number(process.uptime().toFixed(1)),
      timestamp: new Date().toISOString(),
    });
  });

  // /api is the canonical base; /api/v1 is what the browser reaches through
  // the Next.js rewrite. Mounting twice is explicit and works on Express 5,
  // where an array path only matches its first entry.
  app.use("/api", apiRouter);
  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
