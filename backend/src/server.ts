
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/database.js';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memed-api',
    status: 'ok',
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`Meme'd API running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

void startServer();
