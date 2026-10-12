
import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT ?? 5000);

const startServer = async (): Promise<void> => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid number between 1 and 65535');
    }

    await connectDatabase();

    app.listen(port, () => {
      console.log(`Meme'd API running on port ${port}`);
    });
  } catch (error) {
    console.error(
      'Server startup failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exit(1);
  }
};

void startServer();
