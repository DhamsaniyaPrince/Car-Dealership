import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { prisma } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

// Routes
import authRoutes from './routes/auth-routes';
import vehicleRoutes from './routes/vehicle-routes';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 1000 : 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Liveness/Readiness Probe Health Check
app.get('/health', async (_req, res) => {
  try {
    // Run a query raw check to confirm db connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      uptime: process.uptime(),
      database: 'connected',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      uptime: process.uptime(),
      database: 'disconnected',
      timestamp: new Date(),
    });
  }
});

// Routing mounts
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Catch-all undefined routes (404)
app.use((req, _res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

export default app;
