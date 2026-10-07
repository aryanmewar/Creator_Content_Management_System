import xss from "xss";

/**
 * Recursively sanitize an object or string against XSS (Cross-Site Scripting).
 * Strips executable JavaScript, evil event handlers (onerror, onload, onclick, etc.),
 * and converts dangerous HTML tags into safe entities.
 */
const sanitizeValue = (value, key = "") => {
  if (value === null || value === undefined) return value;

  // Never alter password, token, or secret fields to preserve password complexity/hashes
  if (
    typeof key === "string" &&
    /password|token|secret|hash/i.test(key)
  ) {
    return value;
  }

  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (typeof value === "object" && !(value instanceof Date)) {
    const cleanObj = {};
    for (const [k, v] of Object.entries(value)) {
      cleanObj[k] = sanitizeValue(v, k);
    }
    return cleanObj;
  }

  return value;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params against XSS.
 */
export const xssClean = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params);
  }
  next();
};

export default xssClean;
