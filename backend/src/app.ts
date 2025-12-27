import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import { logger } from './utils/logger';

const app: Application = express();


// Middleware
app.use(cors({
  origin: process.env.EC2_INSTANCE_PUBLIC_IP, // Adjust as needed for security
  credentials: true, // Needed if you are sending cookies or authorization headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Multi-Agent LLM Decision System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ask: 'POST /api/chat/ask'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found!',
    path: req.path
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

export default app;
