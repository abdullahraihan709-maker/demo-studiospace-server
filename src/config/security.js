import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Content-Type", "Authorization"];

/**
 * Exact-match allowlist. A wildcard would break credentials: true anyway, and
 * "reflect any origin" is how a read-only demo accidentally becomes a
 * cross-site data source.
 */
function corsOrigin(origin, callback) {
  // No Origin header: curl, Postman, health checks and server-to-server calls.
  if (!origin) return callback(null, true);

  const normalized = origin.replace(/\/+$/, "");
  if (env.clientOrigins.includes(normalized)) return callback(null, true);

  return callback(new ApiError(403, `Origin ${normalized} is not allowed.`, "CORS_ORIGIN_DENIED"));
}

/**
 * One place for the middleware that decides whether a request is safe to handle.
 * Applied before any route, so no endpoint can accidentally opt out.
 */
export function applySecurity(app) {
  app.disable("x-powered-by");

  // Render terminates TLS in front of the app, so rate limits and req.secure
  // need the X-Forwarded-* headers to be trusted exactly one hop deep.
  if (env.isProduction) {
    app.set("trust proxy", 1);
  }

  app.use((req, res, next) => {
    req.id = randomUUID();
    res.setHeader("X-Request-Id", req.id);
    next();
  });

  app.use(
    helmet({
      // This process only speaks JSON. The page CSP belongs to the Next app.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "no-referrer" },
      hsts: env.isProduction
        ? { maxAge: 15552000, includeSubDomains: true, preload: false }
        : false,
    }),
  );

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ALLOWED_METHODS,
      allowedHeaders: ALLOWED_HEADERS,
      exposedHeaders: ["X-Request-Id"],
      maxAge: 86400,
      optionsSuccessStatus: 204,
    }),
  );

  app.use(express.json({ limit: "1mb", strict: true }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());
}
