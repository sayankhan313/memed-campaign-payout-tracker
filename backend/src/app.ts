
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';
import campaignRoutes from './modules/campaign/campaign.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, service: 'memed-api', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.use(errorHandler);

export default app;
