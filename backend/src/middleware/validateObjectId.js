import mongoose from "mongoose";
import { sendError } from "../../utils/response.js";

/**
 * Middleware to validate MongoDB ObjectIds in request parameters.
 * Prevents CastErrors from bubbling up to the error handler.
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        message: `Invalid ID format for ${paramName}`,
        code: "INVALID_ID",
        statusCode: 400,
      });
    }
    next();
  };
};
