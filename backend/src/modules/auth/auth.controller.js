import * as authService from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      role,
    });
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
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
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
    // JWT is stateless; logout is client-side token removal.
    // In future, token blacklisting can be added here.
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
