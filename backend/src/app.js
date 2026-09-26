import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import env from "./config/env.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import instructorRoutes from "./modules/instructors/instructor.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import assignmentRoutes from "./modules/assignments/assignment.routes.js";
import scheduleRoutes from "./modules/schedules/schedule.routes.js";
import publicationRoutes from "./modules/publications/publication.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import activityLogRoutes from "./modules/activityLog/activityLog.routes.js";
import savedLinkRoutes from "./modules/savedLinks/savedLink.routes.js";
import contributorRoutes from "./modules/contributor/contributor.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

// Error handling
import errorHandler, { notFoundHandler } from "./middleware/errorMiddleware.js";
import authorize from "./middleware/roleMiddleware.js";
import protect from "./middleware/authMiddleware.js";

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());

// Restrict CORS to configured origin only
const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((o) => o.trim().replace(/\/$/, ""))
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow local network IPs during development (192.168.x.x, 172.16.x.x to 172.31.x.x, 10.x.x.x, etc.)
      if (
        env.NODE_ENV === "development" &&
        /^https?:\/\/(192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|172\.168\.|10\.|localhost|127\.0\.0\.1)/.test(
          origin,
        )
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting — 500 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
});



app.use(limiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Creator Content Management System API is running.");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Content Manager API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Admin-only Routes
const adminOnly = [protect, authorize("ADMIN", "CONTENT_MANAGER")];
app.use("/api/instructors", ...adminOnly, instructorRoutes);
app.use("/api/content", ...adminOnly, contentRoutes);
app.use("/api/assignments", ...adminOnly, assignmentRoutes);
app.use("/api/schedules", ...adminOnly, scheduleRoutes);
app.use("/api/publications", ...adminOnly, publicationRoutes);
app.use("/api/dashboard", ...adminOnly, dashboardRoutes);
app.use("/api/activity", ...adminOnly, activityLogRoutes);
app.use("/api/saved-links", ...adminOnly, savedLinkRoutes);

// Contributor Routes
app.use(
  "/api/contributor",
  protect,
  authorize("CONTRIBUTOR"),
  contributorRoutes,
);

// Notifications for both roles
app.use("/api/notifications", protect, notificationRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
