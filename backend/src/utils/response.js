/**
 * Centralized API response helpers.
 * All controllers use these to ensure consistent response shape.
 */

export const sendSuccess = (
  res,
  { message = "Success", data = null, statusCode = 200 } = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  {
    message = "An error occurred",
    code = "INTERNAL_ERROR",
    statusCode = 500,
  } = {},
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

export const sendPaginated = (
  res,
  { message = "Success", data = [], pagination = {}, statusCode = 200 } = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};
