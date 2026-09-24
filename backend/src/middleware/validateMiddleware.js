import { sendError } from "../utils/response.js";

/**
 * Zod schema validation middleware factory.
 * Usage: validate(myZodSchema) — validates req.body against schema.
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return sendError(res, {
        message: errors[0]?.message || "Validation failed",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    req[source] = result.data; // Replace with coerced/parsed data
    next();
  };
};

export default validate;
