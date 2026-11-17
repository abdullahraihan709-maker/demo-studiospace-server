import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
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
    uptime: Number(process.uptime().toFixed(1)),
    timestamp: new Date().toISOString(),
  });
});

// 404 for anything not matched above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Central error handler — always last
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 ? "Something went wrong on our side. Please try again." : err.message;

  if (status === 500) {
    console.error("[error]", err);
  }

  res.status(status).json({ success: false, message });
});

app.listen(PORT, () => {
  console.log(`StudioSpace API listening on http://localhost:${PORT}`);
});
