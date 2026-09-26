import env from "../config/env.js";
import fs from "fs";
import path from "path";
/**
 * Centralized Express error handler.
 * Must be registered as the LAST middleware in app.js.
 */
const errorHandler = (err, req, res, next) => {
  // In development, log full stack. In production, log only message.
  if (env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    try {
      fs.appendFileSync(
        path.join(process.cwd(), "error.log"),
        `[ERROR] ${req.method} ${req.originalUrl}: ${err.message}\n${err.stack}\n\n`,
      );
    } catch (e) {}
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
      code: "VALIDATION_ERROR",
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
      code: "DUPLICATE_KEY",
    });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      code: "INVALID_ID",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired.",
      code: "TOKEN_EXPIRED",
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 handler — register before errorHandler but after all routes
 */
export const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = "NOT_FOUND";
  next(err);
};

export default errorHandler;
