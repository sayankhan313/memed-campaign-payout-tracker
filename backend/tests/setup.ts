
import { config } from 'dotenv';

config({ path: '.env.test', override: true, quiet: true });

process.env.NODE_ENV = 'test';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required for integration tests');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('A valid JWT_SECRET is required for tests');
}
