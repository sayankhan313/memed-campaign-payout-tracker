
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/auth/auth.model.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { SubmissionModel } from '../../src/modules/submission/submission.model.js';
import { PayoutModel } from '../../src/modules/payout/payout.model.js';

const unique = `${Date.now()}${process.pid}`;
const password = 'SecureTest123!';
const brandEmail = `jest.brand.${unique}@example.com`;
const creatorEmail = `jest.creator.${unique}@example.com`;
const otherBrandEmail = `jest.other.${unique}@example.com`;

let brandToken = '';
let creatorToken = '';
let otherBrandToken = '';
let campaignId = '';
let submissionId = '';

const campaignIds: string[] = [];

beforeAll(async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error('MONGODB_TEST_URI is missing');
  }

  await mongoose.connect(uri, {
    dbName: 'memed_assignment_jest',
    serverSelectionTimeoutMS: 15000,
  });

  if (mongoose.connection.name !== 'memed_assignment_jest') {
    throw new Error('Unsafe test database configuration');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    if (campaignIds.length > 0) {
      await PayoutModel.deleteMany({ campaignId: { $in: campaignIds } });
      await SubmissionModel.deleteMany({ campaignId: { $in: campaignIds } });
      await CampaignModel.deleteMany({ _id: { $in: campaignIds } });
    }

    await UserModel.deleteMany({
      email: { $in: [brandEmail, creatorEmail, otherBrandEmail] },
    });
  } finally {
    await mongoose.disconnect();
  }
});

describe('Authentication API', () => {
  test('registers Brand and Creator accounts', async () => {
    const accounts = [
      { name: 'Jest Brand', email: brandEmail, role: 'brand' },
      { name: 'Jest Creator', email: creatorEmail, role: 'creator' },
      { name: 'Jest Other Brand', email: otherBrandEmail, role: 'brand' },
    ];

    for (const account of accounts) {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ ...account, password });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toEqual(expect.any(String));

      if (account.email === brandEmail) brandToken = response.body.data.accessToken;
      if (account.email === creatorEmail) creatorToken = response.body.data.accessToken;
      if (account.email === otherBrandEmail) otherBrandToken = response.body.data.accessToken;
    }
  });

  test('logs in with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: brandEmail, password });

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('brand');
  });

  test('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: brandEmail, password: 'IncorrectPassword123!' });

    expect(response.status).toBe(401);
  });

  test('protects the current-user endpoint', async () => {
    const unauthorized = await request(app).get('/api/auth/me');
    expect(unauthorized.status).toBe(401);

    const authorized = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(authorized.status).toBe(200);
    expect(authorized.body.data.role).toBe('creator');
  });
});

describe('Campaign API', () => {
  test('allows Brand to create a campaign', async () => {
    const response = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'Jest Integration Campaign',
        platform: 'instagram',
        totalBudget: 10000,
        milestones: [
          { views: 10000, payout: 500 },
          { views: 50000, payout: 2000 },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.budgetRemaining).toBe(10000);

    campaignId = response.body.data.id;
    campaignIds.push(campaignId);
  });

  test('rejects campaign creation by Creator', async () => {
    const response = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        name: 'Forbidden Campaign',
        platform: 'instagram',
        totalBudget: 1000,
        milestones: [{ views: 10000, payout: 500 }],
      });

    expect(response.status).toBe(403);
  });

  test('prevents another Brand from accessing the campaign', async () => {
    const response = await request(app)
      .get(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${otherBrandToken}`);

    expect(response.status).toBe(404);
  });

  test('allows Creator to browse live campaigns', async () => {
    const response = await request(app)
      .get('/api/campaigns/live')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);

    const campaign = response.body.data.find(
      (item: { id: string }) => item.id === campaignId
    );

    expect(campaign).toBeDefined();
    expect(campaign).not.toHaveProperty('totalBudget');
    expect(campaign).not.toHaveProperty('budgetSpent');
  });
});

describe('Submission API', () => {
  test('allows Creator to submit a post', async () => {
    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        campaignId,
        postUrl: `https://www.instagram.com/reel/JEST${unique}A/`,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.views).toBe(0);
    expect(response.body.data.paidAmount).toBe(0);

    submissionId = response.body.data.id;
  });

  test('rejects duplicate post submissions', async () => {
    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        campaignId,
        postUrl: `https://www.instagram.com/reel/JEST${unique}A/`,
      });

    expect(response.status).toBe(409);
  });

  test('rejects Brand post submissions', async () => {
    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        campaignId,
        postUrl: `https://www.instagram.com/reel/JEST${unique}B/`,
      });

    expect(response.status).toBe(403);
  });
});

describe('Payout API', () => {
  test('pays the highest crossed milestone incrementally', async () => {
    const first = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 10000 });

    expect(first.status).toBe(200);
    expect(first.body.data.totalEarned).toBe(500);
    expect(first.body.data.additionalPayout).toBe(500);

    const second = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 50000 });

    expect(second.status).toBe(200);
    expect(second.body.data.totalEarned).toBe(2000);
    expect(second.body.data.additionalPayout).toBe(1500);
  });

  test('does not pay again for repeated views', async () => {
    const response = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 50000 });

    expect(response.status).toBe(200);
    expect(response.body.data.additionalPayout).toBe(0);
  });

  test('reports Creator earnings and Brand budget correctly', async () => {
    const earnings = await request(app)
      .get('/api/earnings/me')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(earnings.status).toBe(200);
    expect(earnings.body.data.totalEarnings).toBe(2000);

    const campaign = await request(app)
      .get(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(campaign.status).toBe(200);
    expect(campaign.body.data.budgetSpent).toBe(2000);
    expect(campaign.body.data.budgetRemaining).toBe(8000);
  });

  test('prevents overspending when budget is exhausted', async () => {
    const campaign = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'Jest Budget Cap Campaign',
        platform: 'instagram',
        totalBudget: 1000,
        milestones: [{ views: 10000, payout: 1000 }],
      });

    expect(campaign.status).toBe(201);

    const budgetCampaignId = campaign.body.data.id;
    campaignIds.push(budgetCampaignId);

    const createPost = async (suffix: string) => {
      return request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          campaignId: budgetCampaignId,
          postUrl: `https://www.instagram.com/reel/JEST${unique}${suffix}/`,
        });
    };

    const firstPost = await createPost('C');
    const secondPost = await createPost('D');

    expect(firstPost.status).toBe(201);
    expect(secondPost.status).toBe(201);

    const firstPayout = await request(app)
      .patch(`/api/submissions/${firstPost.body.data.id}/views`)
      .send({ views: 10000 });

    expect(firstPayout.status).toBe(200);

    const secondPayout = await request(app)
      .patch(`/api/submissions/${secondPost.body.data.id}/views`)
      .send({ views: 10000 });

    expect(secondPayout.status).toBe(409);

    const storedCampaign = await CampaignModel.findById(budgetCampaignId);
    const rejectedPost = await SubmissionModel.findById(secondPost.body.data.id);
    const ledgerCount = await PayoutModel.countDocuments({ campaignId: budgetCampaignId });

    expect(storedCampaign?.budgetSpent).toBe(1000);
    expect(rejectedPost?.paidAmount).toBe(0);
    expect(rejectedPost?.views).toBe(0);
    expect(ledgerCount).toBe(1);
  });
});
