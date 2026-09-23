import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate a signed JWT token for the given payload.
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or throws if invalid/expired.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
