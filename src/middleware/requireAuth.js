import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * The API never signs tokens. It only verifies the `ss_token` cookie that the
 * Next.js route handler minted, using the same JWT_SECRET on both deployments.
 *
 * Why HTTPOnly: JavaScript on the page cannot read the token, so an XSS bug
 * cannot steal a session. The client therefore cannot send it as a header;
 * the browser attaches the cookie automatically (credentials: "include").
 */
export const AUTH_COOKIE = "ss_token";
const ALGORITHM = "HS256";

function readToken(req) {
  // Bearer support exists for Postman and for the examiner's proof screenshot.
  const header = req.get("authorization");
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  const cookie = req.cookies?.[AUTH_COOKIE];
  return typeof cookie === "string" && cookie.trim() ? cookie.trim() : null;
}

function toUser(payload) {
  const email = String(payload.email ?? "")
    .toLowerCase()
    .trim();
  const fallbackName = email.split("@")[0] || "StudioSpace member";

  return {
    id: String(payload.sub ?? payload.id ?? ""),
    email,
    name:
      typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : fallbackName,
    image: typeof payload.image === "string" ? payload.image : "",
  };
}

function verify(token) {
  // Pinning the algorithm blocks "alg: none" and public-key confusion attacks.
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.email !== "string" ||
    !payload.email.includes("@")
  ) {
    throw new jwt.JsonWebTokenError("Token is missing a usable email claim.");
  }

  return toUser(payload);
}

/**
 * Populates req.user when a valid token is present, but never blocks the
 * request. Used on public endpoints that behave slightly differently for the
 * signed-in owner (e.g. "this is your listing").
 */
export function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next();

  try {
    req.user = verify(token);
  } catch {
    req.user = null;
  }

  return next();
}

export default function requireAuth(req, res, next) {
  const token = readToken(req);

  if (!token) {
    return next(ApiError.unauthorized("Please log in to continue.", "UNAUTHENTICATED"));
  }

  try {
    req.user = verify(token);
    return next();
  } catch (error) {
    const expired = error?.name === "TokenExpiredError";
    return next(
      new ApiError(
        401,
        expired
          ? "Your session expired. Please log in again."
          : "Your session is not valid. Please log in again.",
        expired ? "SESSION_EXPIRED" : "INVALID_TOKEN",
      ),
    );
  }
}
