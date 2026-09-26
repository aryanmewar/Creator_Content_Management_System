import User from "./auth.model.js";
import Instructor from "../instructors/instructor.model.js";
import { generateToken } from "../../utils/generateToken.js";
import { USER_ROLES } from "../../utils/statusUtils.js";

/**
 * Register a new user.
 */
export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.statusCode = 409;
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // Model pre-save hook will hash it
    role: role || "CONTENT_MANAGER",
  });

  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

/**
 * Login a user with email + password.
 */
export const loginUser = async ({ email, password }) => {
  // Explicitly select passwordHash since it's hidden by default
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  if (!user.isActive) {
    const err = new Error(
      "Your account has been deactivated. Please contact an administrator.",
    );
    err.statusCode = 403;
    err.code = "ACCOUNT_DEACTIVATED";
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({ id: user._id, role: user.role });

  // Remove passwordHash from response
  const userObj = user.toJSON();

  return { user: userObj, token };
};

/**
 * Get current user profile.
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.code = "USER_NOT_FOUND";
    throw err;
  }
  return user;
};

/**
 * Admin creates a contributor account.
 */
export const createContributorAccount = async ({
  name,
  email,
  password,
  designation,
  adminId,
  role = USER_ROLES.CONTRIBUTOR,
}) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.statusCode = 409;
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  // Auto-generate password if not provided
  const finalPassword =
    password || Math.random().toString(36).slice(-8) + "A1!";

  // 1. Create User with specified role (default CONTRIBUTOR)
  const user = await User.create({
    name,
    email,
    passwordHash: finalPassword,
    role: role,
  });

  // 2. Create Instructor profile linked to User
  const instructor = await Instructor.create({
    name,
    email,
    designation: designation || "Contributor",
    userId: user._id,
    createdBy: adminId,
  });

  return { user, instructor };
};
