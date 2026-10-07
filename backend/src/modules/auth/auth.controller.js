import * as authService from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { generateCsrfToken, setCsrfCookies } from "../../middleware/csrfMiddleware.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      role,
    });
    // Set JWT as HttpOnly cookie — inaccessible to JS (XSS-safe)
    res.cookie("cms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Refresh CSRF token for the authenticated session
    const csrfToken = generateCsrfToken();
    setCsrfCookies(res, csrfToken);
    return sendSuccess(res, {
      message: "Account created successfully.",
      data: { user, token },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;
    const { user, token } = await authService.loginUser({ email, password, remember });
    // Set cookie maxAge based on remember (365 days if remember is true, else 30 days)
    const maxAge = remember
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

    res.cookie("cms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge,
    });

    // Refresh CSRF token for the authenticated session
    const csrfToken = generateCsrfToken();
    setCsrfCookies(res, csrfToken);
    return sendSuccess(res, {
      message: "Login successful.",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return sendSuccess(res, { data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Clear the HttpOnly cookie and CSRF cookies server-side
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("cms_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.clearCookie("XSRF-TOKEN", {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });
    res.clearCookie("_csrf", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });
    return sendSuccess(res, { message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};

export const createContributor = async (req, res, next) => {
  try {
    const { name, email, password, designation } = req.body;
    const result = await authService.createContributorAccount({
      name,
      email,
      password,
      designation,
      adminId: req.user._id,
    });

    return sendSuccess(res, {
      message: "Contributor account created successfully.",
      data: result,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, {
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, {
        message: "Current password and new password are required.",
        statusCode: 400,
      });
    }
    const result = await authService.changePassword(req.user._id, {
      currentPassword,
      newPassword,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getSystemStatus = async (req, res, next) => {
  try {
    const status = await authService.getSystemStatus();
    return sendSuccess(res, { data: status });
  } catch (error) {
    next(error);
  }
};

export const exportBackup = async (req, res, next) => {
  try {
    const backup = await authService.exportBackup();
    return sendSuccess(res, {
      message: "Backup generated successfully.",
      data: backup,
    });
  } catch (error) {
    next(error);
  }
};

export const getCsrfToken = (req, res) => {
  const token = req.csrfToken ? req.csrfToken() : generateCsrfToken();
  return sendSuccess(res, {
    message: "CSRF token retrieved successfully.",
    data: { csrfToken: token },
  });
};

