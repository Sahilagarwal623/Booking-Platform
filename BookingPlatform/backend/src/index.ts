import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import routes from './routes';
import { notFound, errorHandler } from './middleware';
import { initializeCronJobs } from './jobs/cron';
import { config } from './config';

// Load env vars
dotenv.config();

const app = express();
const port = config.port;

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check (before routes)
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Booking Platform API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`[server] Server is running at http://localhost:${port}`);
  console.log(`[server] Environment: ${config.nodeEnv}`);

  // Initialize background jobs
  initializeCronJobs();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;