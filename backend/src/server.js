import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import { initScheduleMonitor } from "./jobs/scheduleMonitor.js";

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Background Jobs
    initScheduleMonitor();

    app.listen(env.PORT, () => {
      console.log(`\n🚀 Content Manager API`);
      console.log(`   Environment : ${env.NODE_ENV}`);
      console.log(`   Port        : ${env.PORT}`);
      console.log(`   URL         : http://localhost:${env.PORT}/api`);
      console.log(`   Health      : http://localhost:${env.PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();
