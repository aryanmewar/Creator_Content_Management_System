import mongoose from "mongoose";
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
export const loginUser = async ({ email, password, remember }) => {
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

  // If remember is true, set long-lived 365 days token, otherwise default 30 days
  const expiresIn = remember ? "365d" : "30d";
  const token = generateToken({ id: user._id, role: user.role }, expiresIn);

  // Remove passwordHash from response
  const userObj = user.toJSON();

  return { user: userObj, token, remember };
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

/**
 * Update current user profile
 */
export const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  if (data.name !== undefined) user.name = data.name.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.bio !== undefined) user.bio = data.bio.trim();
  if (data.avatar !== undefined) user.avatar = data.avatar;
  if (data.socialLinks !== undefined) {
    user.socialLinks = { ...user.socialLinks?.toObject?.() || {}, ...data.socialLinks };
  }
  if (data.preferences !== undefined) {
    user.preferences = { ...user.preferences?.toObject?.() || {}, ...data.preferences };
  }

  await user.save();

  // Also update corresponding Instructor record if exists
  await Instructor.findOneAndUpdate({ userId }, { name: user.name }).catch(() => {});

  return user;
};

/**
 * Change password
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error("Current password is incorrect.");
    err.statusCode = 400;
    err.code = "INVALID_PASSWORD";
    throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error("New password must be at least 6 characters.");
    err.statusCode = 400;
    err.code = "WEAK_PASSWORD";
    throw err;
  }

  user.passwordHash = newPassword;
  await user.save();

  return { message: "Password updated successfully." };
};

/**
 * System status for settings
 */
export const getSystemStatus = async () => {
  const [contentCount, instructorCount, userCount, scheduleCount] = await Promise.all([
    mongoose.model("Content").countDocuments().catch(() => 0),
    Instructor.countDocuments().catch(() => 0),
    User.countDocuments().catch(() => 0),
    mongoose.model("Schedule").countDocuments().catch(() => 0),
  ]);

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const mem = process.memoryUsage();

  return {
    server: {
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      uptimeSeconds,
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || "development",
      memoryUsage: `${Math.round(mem.heapUsed / 1024 / 1024)} MB / ${Math.round(mem.rss / 1024 / 1024)} MB`,
    },
    database: {
      status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      dbName: mongoose.connection.name || "creatolyt_cms",
      collections: {
        content: contentCount,
        instructors: instructorCount,
        users: userCount,
        schedules: scheduleCount,
      },
    },
    security: {
      jwtExpiry: "7 days (365d for remember me)",
      hashRounds: "bcrypt 12 rounds",
      rateLimiter: "Active (500 req/15min)",
      cors: "Configured & Protected",
      rbac: "Active (ADMIN, CONTENT_MANAGER, CONTRIBUTOR)",
    },
  };
};

/**
 * Export backup data
 */
export const exportBackup = async () => {
  const [contents, instructors, users, schedules] = await Promise.all([
    mongoose.model("Content").find().lean().catch(() => []),
    Instructor.find().lean().catch(() => []),
    User.find().select("-passwordHash").lean().catch(() => []),
    mongoose.model("Schedule").find().lean().catch(() => []),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    appName: "Createlyt CMS",
    counts: {
      contents: contents.length,
      instructors: instructors.length,
      users: users.length,
      schedules: schedules.length,
    },
    data: {
      contents,
      instructors,
      users,
      schedules,
    },
  };
};

