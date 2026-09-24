/**
 * Seed script — creates a default admin user.
 * Run: npm run seed
 * WARNING: Only run once on a fresh database.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";
import User from "./modules/auth/auth.model.js";

const seed = async () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const existing = await User.findOne({ email: "aryansharma@ricr.in" });
  if (existing) {
    console.log("ℹ️  Admin user already exists. Skipping seed.");
    process.exit(0);
  }

  await User.create({
    name: "Aryan Sharma",
    email: "aryansharma@ricr.in",
    passwordHash: "Admin@1234", // Will be hashed by pre-save hook
    role: "ADMIN",
    isActive: true,
  });

  console.log("✅ Default admin created:");
  console.log("   Email   : aryansharma@ricr.in");
  console.log("   Password: Admin@1234");
  console.log("   ⚠️  Change the password after first login!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
