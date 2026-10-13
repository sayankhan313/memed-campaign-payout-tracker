
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/auth/auth.model.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { SubmissionModel } from '../../src/modules/submission/submission.model.js';
import { PayoutModel } from '../../src/modules/payout/payout.model.js';

const unique = `${Date.now()}${process.pid}`;
const password = 'SecureTest123!';
const brandEmail = `submissions.brand.${unique}@example.com`;
const otherBrandEmail = `submissions.otherbrand.${unique}@example.com`;
const creatorEmail = `submissions.creator.${unique}@example.com`;
const secondCreatorEmail = `submissions.secondcreator.${unique}@example.com`;
const emails = [brandEmail, otherBrandEmail, creatorEmail, secondCreatorEmail];
const campaignIds: string[] = [];

let brandToken = '';
let otherBrandToken = '';
let creatorToken = '';
let secondCreatorToken = '';
let campaignId = '';
let emptyCampaignId = '';
let submissionId = '';
let secondSubmissionId = '';

async function registerUser(
  name: string,
  email: string,
  role: 'brand' | 'creator',
  profiles: Record<string, string> = {}
): Promise<string> {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ name, email, password, role, ...profiles });

  if (response.status !== 201) {
    throw new Error(`Test signup failed for ${role}: ${response.body.message}`);
  }

  return response.body.data.accessToken;
}

async function createTestCampaign(name: string): Promise<string> {
  const response = await request(app)
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${brandToken}`)
    .send({
      name,
      description: 'Create an engaging Instagram Reel promoting our new products.',
      platform: 'instagram',
      totalBudget: 10000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 },
      ],
    });

  if (response.status !== 201) {
    throw new Error(`Test campaign creation failed: ${response.body.message}`);
  }

  const id: string = response.body.data.id;
  campaignIds.push(id);
  return id;
}

async function createTestSubmission(token: string, suffix: string): Promise<string> {
  const response = await request(app)
    .post('/api/submissions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      campaignId,
      postUrl: `https://www.instagram.com/reel/MEMED${unique}${suffix}/`,
    });

  if (response.status !== 201) {
    throw new Error(`Test submission creation failed: ${response.body.message}`);
  }

  return response.body.data.id;
}

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_TEST_URI, {
    dbName: 'memed_assignment_jest',
    serverSelectionTimeoutMS: 15000,
  });

  if (mongoose.connection.name !== 'memed_assignment_jest') {
    throw new Error('Unsafe test database configuration');
  }

  brandToken = await registerUser('Test Brand Studio', brandEmail, 'brand');
  otherBrandToken = await registerUser('Other Brand Studio', otherBrandEmail, 'brand');

  creatorToken = await registerUser('Rahul Creator', creatorEmail, 'creator', {
    instagramUsername: '@rahul.creates',
    youtubeChannelUrl: 'https://www.youtube.com/@rahulcreates',
  });

  secondCreatorToken = await registerUser('Alex Creator', secondCreatorEmail, 'creator');

  campaignId = await createTestCampaign('Creator Submission Test');
  emptyCampaignId = await createTestCampaign('Empty Submission Test');

  submissionId = await createTestSubmission(creatorToken, 'A');
  secondSubmissionId = await createTestSubmission(secondCreatorToken, 'B');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    await PayoutModel.deleteMany({ campaignId: { $in: campaignIds } });
    await SubmissionModel.deleteMany({ campaignId: { $in: campaignIds } });
    await CampaignModel.deleteMany({ _id: { $in: campaignIds } });
    await UserModel.deleteMany({ email: { $in: emails } });
  } finally {
    await mongoose.disconnect();
  }
});

describe('Brand Creator Submissions API', () => {
  test('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('rejects Creator access to Brand submissions', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test('prevents another Brand from accessing submissions', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${otherBrandToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('rejects invalid campaign IDs', async () => {
    const response = await request(app)
      .get('/api/campaigns/invalid-id/submissions')
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(400);
  });

  test('allows owning Brand to view campaign submissions', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);

    const ids = response.body.data.map((item: { id: string }) => item.id);

    expect(ids).toContain(submissionId);
    expect(ids).toContain(secondSubmissionId);
  });

  test('returns Creator name and social profiles correctly', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);

    const submission = response.body.data.find(
      (item: { id: string }) => item.id === submissionId
    );

    expect(submission).toBeDefined();
    expect(submission.creator.name).toBe('Rahul Creator');
    expect(submission.creator.instagramUsername).toBe('rahul.creates');
    expect(submission.creator.youtubeChannelUrl).toBe('https://www.youtube.com/@rahulcreates');
    expect(submission.postUrl).toContain('instagram.com/reel/');
    expect(submission.views).toBe(0);
    expect(submission.paidAmount).toBe(0);
  });

  test('does not expose sensitive Creator account fields', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);

    for (const submission of response.body.data) {
      expect(submission.creator).not.toHaveProperty('email');
      expect(submission.creator).not.toHaveProperty('password');
      expect(submission.creator).not.toHaveProperty('passwordHash');
      expect(submission.creator).not.toHaveProperty('accessToken');
      expect(submission.creator).not.toHaveProperty('role');
      expect(submission).not.toHaveProperty('creatorId');
    }
  });

  test('supports Creators without social profiles', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);

    const submission = response.body.data.find(
      (item: { id: string }) => item.id === secondSubmissionId
    );

    expect(submission).toBeDefined();
    expect(submission.creator.name).toBe('Alex Creator');
    expect(submission.creator.instagramUsername).toBeUndefined();
    expect(submission.creator.youtubeChannelUrl).toBeUndefined();
  });

  test('returns an empty array when the campaign has no submissions', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${emptyCampaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test('reflects updated views and Creator earnings', async () => {
    const payout = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 10000 });

    expect(payout.status).toBe(200);
    expect(payout.body.data.additionalPayout).toBe(500);

    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);

    const submission = response.body.data.find(
      (item: { id: string }) => item.id === submissionId
    );

    expect(submission.views).toBe(10000);
    expect(submission.paidAmount).toBe(500);
  });

  test('retains submission history after campaign archiving', async () => {
    const complete = await request(app)
      .patch(`/api/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${brandToken}`)
      .send({ action: 'complete' });

    expect(complete.status).toBe(200);

    const archive = await request(app)
      .patch(`/api/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${brandToken}`)
      .send({ action: 'archive' });

    expect(archive.status).toBe(200);

    const response = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);

    const submission = response.body.data.find(
      (item: { id: string }) => item.id === submissionId
    );

    expect(submission.paidAmount).toBe(500);
  });
});
