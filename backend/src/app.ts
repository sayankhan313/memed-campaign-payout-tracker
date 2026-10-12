
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';
import { AuthError } from './modules/auth/auth.error.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memed-api',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON request body',
    });
    return;
  }

  console.error('Unhandled API error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

app.use(errorHandler);

export default app;
