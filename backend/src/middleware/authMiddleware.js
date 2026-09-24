import { verifyToken } from "../utils/generateToken.js";
import { sendError } from "../utils/response.js";
import User from "../modules/auth/auth.model.js";

/**
 * Protect routes — validates JWT and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, {
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
        statusCode: 401,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user || !user.isActive) {
      return sendError(res, {
        message: "User not found or deactivated.",
        code: "INVALID_USER",
        statusCode: 401,
      });
    }

    // Update last active timestamp (throttle to once every 5 minutes to reduce DB load)
    if (
      !user.lastLoginAt ||
      Date.now() - new Date(user.lastLoginAt).getTime() > 5 * 60 * 1000
    ) {
      user.lastLoginAt = new Date();
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, {
        message: "Token has expired. Please login again.",
        code: "TOKEN_EXPIRED",
        statusCode: 401,
      });
    }
    return sendError(res, {
      message: "Invalid token.",
      code: "INVALID_TOKEN",
      statusCode: 401,
    });
  }
};

export default protect;
