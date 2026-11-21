import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { getDbState } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

/**
 * Builds the Express app without listening.
 * Keeping construction separate from boot lets the seed/health tools and any
 * future integration test import the same stack the server actually runs.
 */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
