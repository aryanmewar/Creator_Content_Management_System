import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import instructorRoutes from './modules/instructors/instructor.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import assignmentRoutes from './modules/assignments/assignment.routes.js';
import scheduleRoutes from './modules/schedules/schedule.routes.js';
import publicationRoutes from './modules/publications/publication.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import activityLogRoutes from './modules/activityLog/activityLog.routes.js';

// Error handling
import errorHandler, { notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again later.', code: 'AUTH_RATE_LIMIT' },
});

app.use(limiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Content Manager API is running.', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity', activityLogRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
