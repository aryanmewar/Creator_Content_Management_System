import { sendError } from '../utils/response.js';

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('ADMIN', 'CONTENT_MANAGER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        message: 'Authentication required.',
        code: 'UNAUTHENTICATED',
        statusCode: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        message: `Role '${req.user.role}' is not authorized to perform this action.`,
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    next();
  };
};

export default authorize;
