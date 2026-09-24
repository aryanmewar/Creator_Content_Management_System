import mongoose from "mongoose";
import dns from "dns";
import env from "./env.js";

const connectDB = async () => {
  try {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4 to prevent querySrv ECONNREFUSED on Windows
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Removed process.exit(1) to allow the API server to start even if DB connection fails
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

export default connectDB;
