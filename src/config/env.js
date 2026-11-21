import "dotenv/config";

/**
 * Environment contract for the StudioSpace API.
 *
 * The server refuses to start when something is missing or obviously wrong.
 * A crash at boot with a readable message is far cheaper than a 500 at 2 a.m.
 * that only says "jwt malformed" because JWT_SECRET was never set on Render.
 */

const REQUIRED_KEYS = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const MIN_SECRET_LENGTH = 32;

function refuseToStart(problems) {
  const rule = "-".repeat(68);
  console.error(`\n${rule}`);
  console.error("  StudioSpace API cannot start: environment problem(s)");
  console.error(rule);
  for (const problem of problems) {
    console.error(`  * ${problem}`);
  }
  console.error("\n  Fix server/.env locally, or the environment variables on Render.");
  console.error("  Reference: server/.env.example");
  console.error(`${rule}\n`);
  process.exit(1);
}

const problems = [];

const missing = REQUIRED_KEYS.filter((key) => !(process.env[key] ?? "").trim());
if (missing.length > 0) {
  problems.push(`Missing required variable(s): ${missing.join(", ")}.`);
}

const jwtSecret = (process.env.JWT_SECRET ?? "").trim();
if (jwtSecret && jwtSecret.length < MIN_SECRET_LENGTH) {
  problems.push(
    `JWT_SECRET is only ${jwtSecret.length} characters; at least ${MIN_SECRET_LENGTH} are required. ` +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
  );
}

const mongodbUri = (process.env.MONGODB_URI ?? "").trim();
if (mongodbUri && !/^mongodb(\+srv)?:\/\//i.test(mongodbUri)) {
  problems.push("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
}

const rawPort = (process.env.PORT ?? "5000").trim();
const port = Number(rawPort);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  problems.push(`PORT must be a whole number between 1 and 65535 (received "${rawPort}").`);
}

const clientOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

for (const origin of clientOrigins) {
  try {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      problems.push(`CLIENT_URL entry "${origin}" must use http or https.`);
    }
  } catch {
    problems.push(`CLIENT_URL entry "${origin}" is not a valid URL.`);
  }
}

if (problems.length > 0) {
  refuseToStart(problems);
}

const nodeEnv = (process.env.NODE_ENV ?? "development").trim();

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === "production",
  port,
  mongodbUri,
  jwtSecret,
  clientOrigins,
});
