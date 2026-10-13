import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/auth/auth.model.js';

const unique = `${Date.now()}${process.pid}`;
const creatorEmail = `creator.profile.${unique}@example.com`;
const brandEmail = `brand.profile.${unique}@example.com`;
const password = 'ProfilePass123!';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error('MONGODB_TEST_URI is required');
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName: 'memed_assignment_jest', serverSelectionTimeoutMS: 15000 });
  if (mongoose.connection.name !== 'memed_assignment_jest') throw new Error('Unsafe test database');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await UserModel.deleteMany({ email: { $in: [creatorEmail, brandEmail] } });
  } finally {
    await mongoose.disconnect();
  }
});

describe('Signup profile persistence', () => {
  test('persists optional creator social profiles and returns them in current-user response', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Creator Studio',
      email: creatorEmail,
      password,
      role: 'creator',
      instagramUsername: '@creator.studio',
      youtubeChannelUrl: 'https://www.youtube.com/@creatorstudio',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.instagramUsername).toBe('creator.studio');
    expect(response.body.data.user.youtubeChannelUrl).toBe('https://www.youtube.com/@creatorstudio');

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${response.body.data.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.instagramUsername).toBe('creator.studio');
    expect(me.body.data.youtubeChannelUrl).toBe('https://www.youtube.com/@creatorstudio');
  });

  test('registers Brand using company name and no creator profile data', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Autumn Agency', email: brandEmail, password, role: 'brand',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.name).toBe('Autumn Agency');
    expect(response.body.data.user.instagramUsername).toBeUndefined();
    expect(response.body.data.user.youtubeChannelUrl).toBeUndefined();
  });

  test('rejects invalid creator channel URLs', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Creator Studio',
      email: `invalid.creator.${unique}@example.com`,
      password,
      role: 'creator',
      youtubeChannelUrl: 'https://not-youtube.example/@creator',
    });
    expect(response.status).toBe(400);
  });
});
