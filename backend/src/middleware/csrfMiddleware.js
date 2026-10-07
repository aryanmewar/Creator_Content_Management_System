import crypto from "crypto";
import env from "../config/env.js";
import { sendError } from "../utils/response.js";

const CSRF_SECRET = env.JWT_SECRET || "content-app-csrf-secret-key-32chars";
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cryptographically signed CSRF token
 * Format: <randomSalt>.<timestamp>.<hmacSignature>
 */
export const generateCsrfToken = () => {
  const salt = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const data = `${salt}.${timestamp}`;
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(data)
    .digest("hex");
  return `${data}.${signature}`;
};

/**
 * Verify a CSRF token's cryptographic signature and timestamp
 */
export const verifyCsrfToken = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [salt, timestamp, signature] = parts;
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  // Check 24-hour expiration
  if (Date.now() - tokenTime > TOKEN_MAX_AGE_MS || tokenTime > Date.now() + 60000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(`${salt}.${timestamp}`)
    .digest("hex");

  if (signature.length !== expectedSignature.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch {
    return false;
  }
};

/**
 * Set both XSRF-TOKEN (readable by frontend) and _csrf (HttpOnly) cookies
 */
export const setCsrfCookies = (res, token) => {
  const isProduction = env.NODE_ENV === "production";

  // Cookie readable by JavaScript (Axios reads this automatically)
  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_MS,
  });

  // HttpOnly cookie for double-submit verification
  res.cookie("_csrf", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_MS,
  });
};

/**
 * CSRF Protection Middleware for Express
 */
export const csrfProtect = (req, res, next) => {
  // Allow safe/idempotent HTTP methods (GET, HEAD, OPTIONS)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    // If client has a valid CSRF cookie, reuse it; otherwise issue a fresh one
    const existingCookie = req.cookies?.["_csrf"] || req.cookies?.["XSRF-TOKEN"];
    let token = existingCookie;
    if (!existingCookie || !verifyCsrfToken(existingCookie)) {
      token = generateCsrfToken();
      setCsrfCookies(res, token);
    }
    req.csrfToken = () => token;
    return next();
  }

  // 1. Origin / Referer Verification for state-changing requests
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const originHost = new URL(origin).origin;
      const allowedOrigins = env.CLIENT_URL
        ? env.CLIENT_URL.split(",").map((o) => o.trim().replace(/\/$/, ""))
        : ["http://localhost:5173"];

      const isAllowed = allowedOrigins.some((allowed) => {
        try {
          return new URL(allowed).origin === originHost;
        } catch {
          return allowed === originHost;
        }
      });

      const isLocalDev =
        env.NODE_ENV === "development" &&
        /^https?:\/\/(192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|172\.168\.|10\.|localhost|127\.0\.0\.1)(:\d+)?$/.test(
          originHost,
        );

      if (!isAllowed && !isLocalDev) {
        return sendError(res, {
          message: "CSRF blocked: request origin not permitted.",
          code: "CSRF_ORIGIN_INVALID",
          statusCode: 403,
        });
      }
    } catch {
      // Invalid URL format in origin
      return sendError(res, {
        message: "CSRF blocked: invalid request origin.",
        code: "CSRF_ORIGIN_MALFORMED",
        statusCode: 403,
      });
    }
  }

  // 2. Extract CSRF token from request headers or body
  const tokenFromHeader =
    req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"] ||
    req.body?._csrf;

  if (!tokenFromHeader) {
    return sendError(res, {
      message: "CSRF protection: missing CSRF token. Please refresh the page.",
      code: "CSRF_TOKEN_MISSING",
      statusCode: 403,
    });
  }

  // 3. Verify cryptographic signature of the token
  if (!verifyCsrfToken(tokenFromHeader)) {
    // Generate a fresh token so the client can recover immediately on retry
    const freshToken = generateCsrfToken();
    setCsrfCookies(res, freshToken);

    return sendError(res, {
      message: "CSRF protection: invalid or expired CSRF token. A new token has been issued.",
      code: "CSRF_TOKEN_INVALID",
      statusCode: 403,
    });
  }

  // 4. Double Submit Cookie verification (if cookie is present, it must match)
  const tokenFromCookie = req.cookies?.["_csrf"] || req.cookies?.["XSRF-TOKEN"];
  if (tokenFromCookie && tokenFromCookie !== tokenFromHeader) {
    return sendError(res, {
      message: "CSRF protection: token mismatch between header and cookie.",
      code: "CSRF_TOKEN_MISMATCH",
      statusCode: 403,
    });
  }

  next();
};

export default csrfProtect;
