
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/auth/auth.model.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { SubmissionModel } from '../../src/modules/submission/submission.model.js';
import { PayoutModel } from '../../src/modules/payout/payout.model.js';
import { ViewSpikeModel } from '../../src/modules/payout/view-spike.model.js';

const unique = `${Date.now()}${process.pid}`;
const password = 'SecureTest123!';
const emails: string[] = [];
const campaignIds: string[] = [];
const originalDemoFlag = process.env.ENABLE_DEMO_VIEW_SIMULATOR;

let brandToken = '';
let otherBrandToken = '';
let creatorToken = '';
let secondCreatorToken = '';
let submissionSequence = 0;

const defaultMilestones = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 4000 },
  { views: 200000, payout: 6000 },
];

async function registerUser(name: string, role: 'brand' | 'creator'): Promise<string> {
  const email = `spike.${role}.${emails.length}.${unique}@example.com`;
  emails.push(email);

  const response = await request(app).post('/api/auth/signup').send({
    name,
    email,
    password,
    role,
    ...(role === 'creator' ? { instagramUsername: `spike.creator${emails.length}` } : {}),
  });

  if (response.status !== 201) {
    throw new Error(`Signup failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return response.body.data.accessToken;
}

async function createCampaign(
  token: string,
  totalBudget = 20000,
  milestones = defaultMilestones,
): Promise<string> {
  const response = await request(app)
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `View Spike Integration ${campaignIds.length + 1}`,
      description: 'Integration testing for view spikes, payout protection and Brand analytics.',
      platform: 'instagram',
      totalBudget,
      milestones,
    });

  if (response.status !== 201) {
    throw new Error(`Campaign creation failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const campaignId: string = response.body.data.id;
  campaignIds.push(campaignId);
  return campaignId;
}

async function createSubmission(token: string, campaignId: string): Promise<string> {
  submissionSequence += 1;

  const response = await request(app)
    .post('/api/submissions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      campaignId,
      postUrl: `https://www.instagram.com/reel/SPIKE${unique}${submissionSequence}/`,
    });

  if (response.status !== 201) {
    throw new Error(`Submission creation failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return response.body.data.id;
}

async function simulateViews(
  token: string,
  submissionId: string,
  views: number,
  mode: 'MILESTONE_DEMO' | 'SPIKE_DEMO',
) {
  return request(app)
    .patch(`/api/demo/submissions/${submissionId}/views`)
    .set('Authorization', `Bearer ${token}`)
    .send({ views, mode });
}

beforeAll(async () => {
  process.env.ENABLE_DEMO_VIEW_SIMULATOR = 'true';

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

  brandToken = await registerUser('Spike Test Brand', 'brand');
  otherBrandToken = await registerUser('Other Spike Brand', 'brand');
  creatorToken = await registerUser('Spike Test Creator', 'creator');
  secondCreatorToken = await registerUser('Second Spike Creator', 'creator');
});

afterAll(async () => {
  if (originalDemoFlag === undefined) delete process.env.ENABLE_DEMO_VIEW_SIMULATOR;
  else process.env.ENABLE_DEMO_VIEW_SIMULATOR = originalDemoFlag;

  if (mongoose.connection.readyState !== 1) return;

  try {
    await ViewSpikeModel.deleteMany({ campaignId: { $in: campaignIds } });
    await PayoutModel.deleteMany({ campaignId: { $in: campaignIds } });
    await SubmissionModel.deleteMany({ campaignId: { $in: campaignIds } });
    await CampaignModel.deleteMany({ _id: { $in: campaignIds } });
    await UserModel.deleteMany({ email: { $in: emails } });
  } finally {
    await mongoose.disconnect();
  }
});

describe('View Spike Integration and Security', () => {
  test('rejects unauthenticated demo simulation requests', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await request(app)
      .patch(`/api/demo/submissions/${submissionId}/views`)
      .send({ views: 100000, mode: 'SPIKE_DEMO' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(await ViewSpikeModel.countDocuments({ submissionId })).toBe(0);
  });

  test('rejects Brand accounts from the Creator simulator', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await simulateViews(brandToken, submissionId, 100000, 'SPIKE_DEMO');

    expect(response.status).toBe(403);
    expect(await ViewSpikeModel.countDocuments({ submissionId })).toBe(0);
  });

  test('prevents Creators from simulating another Creator submission', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await simulateViews(secondCreatorToken, submissionId, 100000, 'SPIKE_DEMO');

    expect([403, 404]).toContain(response.status);
    expect(await ViewSpikeModel.countDocuments({ submissionId })).toBe(0);

    const submission = await SubmissionModel.findById(submissionId);
    expect(submission?.views).toBe(0);
  });

  test('rejects unsupported simulation modes', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await request(app)
      .patch(`/api/demo/submissions/${submissionId}/views`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ views: 100000, mode: 'UNSUPPORTED_MODE' });

    expect(response.status).toBe(400);
    expect(await ViewSpikeModel.countDocuments({ submissionId })).toBe(0);
  });

  test('Milestone Demo pays correctly without creating spike audit records', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await simulateViews(creatorToken, submissionId, 100000, 'MILESTONE_DEMO');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.views).toBe(100000);
    expect(response.body.data.additionalPayout).toBe(4000);
    expect(response.body.data.totalEarned).toBe(4000);

    const submission = await SubmissionModel.findById(submissionId);
    const campaign = await CampaignModel.findById(campaignId);
    const payouts = await PayoutModel.find({ submissionId });

    expect(submission?.views).toBe(100000);
    expect(submission?.paidAmount).toBe(4000);
    expect(campaign?.budgetSpent).toBe(4000);
    expect(payouts).toHaveLength(1);
    expect(await ViewSpikeModel.countDocuments({ submissionId })).toBe(0);
  });

  test('Spike Demo saves a persistent MongoDB audit record', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await simulateViews(creatorToken, submissionId, 100000, 'SPIKE_DEMO');

    expect(response.status).toBe(200);
    expect(response.body.data.views).toBe(100000);
    expect(response.body.data.additionalPayout).toBe(4000);

    const records = await ViewSpikeModel.find({ submissionId });

    expect(records).toHaveLength(1);
    expect(records[0].previousViews).toBe(0);
    expect(records[0].newViews).toBe(100000);
    expect(records[0].deltaViews).toBe(100000);
    expect(records[0].source).toBe('SPIKE_DEMO');
    expect(String(records[0].campaignId)).toBe(campaignId);
    expect(records[0].reason).toContain('100,000');
  });

  test('replaying the same views does not double-pay or duplicate the spike', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const first = await simulateViews(creatorToken, submissionId, 100000, 'SPIKE_DEMO');
    const second = await simulateViews(creatorToken, submissionId, 100000, 'SPIKE_DEMO');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.data.additionalPayout).toBe(4000);
    expect(second.body.data.additionalPayout).toBe(0);

    const campaign = await CampaignModel.findById(campaignId);
    const submission = await SubmissionModel.findById(submissionId);
    const payouts = await PayoutModel.find({ submissionId });
    const spikes = await ViewSpikeModel.find({ submissionId });

    expect(campaign?.budgetSpent).toBe(4000);
    expect(submission?.paidAmount).toBe(4000);
    expect(payouts).toHaveLength(1);
    expect(spikes).toHaveLength(1);
  });

  test('the public simulated platform endpoint also records unusual increases', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const response = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 100000 });

    expect(response.status).toBe(200);

    const records = await ViewSpikeModel.find({ submissionId });

    expect(records).toHaveLength(1);
    expect(records[0].source).toBe('SIMULATED_PLATFORM');
    expect(records[0].deltaViews).toBe(100000);
  });

  test('Brand campaign submissions expose the latest spike only to the owning Brand', async () => {
    const campaignId = await createCampaign(brandToken);
    const submissionId = await createSubmission(creatorToken, campaignId);

    const simulation = await simulateViews(creatorToken, submissionId, 100000, 'SPIKE_DEMO');
    expect(simulation.status).toBe(200);

    const ownerResponse = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(ownerResponse.status).toBe(200);

    const submission = ownerResponse.body.data.find((item: { id: string }) => item.id === submissionId);

    expect(submission).toBeDefined();
    expect(submission.latestSpike).toMatchObject({
      previousViews: 0,
      newViews: 100000,
      deltaViews: 100000,
      source: 'SPIKE_DEMO',
    });
    expect(submission.creator).not.toHaveProperty('email');
    expect(submission.creator).not.toHaveProperty('passwordHash');

    const otherBrandResponse = await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${otherBrandToken}`);

    expect(otherBrandResponse.status).toBe(404);
  });

  test('Brand analytics remains private between different Brands', async () => {
    const campaignA = await createCampaign(brandToken);
    const campaignB = await createCampaign(otherBrandToken);
    const submissionA = await createSubmission(creatorToken, campaignA);
    const submissionB = await createSubmission(secondCreatorToken, campaignB);

    expect((await simulateViews(creatorToken, submissionA, 100000, 'SPIKE_DEMO')).status).toBe(200);
    expect((await simulateViews(secondCreatorToken, submissionB, 100000, 'SPIKE_DEMO')).status).toBe(200);

    const [brandA, brandB, creator] = await Promise.all([
      request(app).get('/api/campaigns/brand/spike-analytics')
        .set('Authorization', `Bearer ${brandToken}`),
      request(app).get('/api/campaigns/brand/spike-analytics')
        .set('Authorization', `Bearer ${otherBrandToken}`),
      request(app).get('/api/campaigns/brand/spike-analytics')
        .set('Authorization', `Bearer ${creatorToken}`),
    ]);

    expect(brandA.status).toBe(200);
    expect(brandB.status).toBe(200);
    expect(creator.status).toBe(403);

    expect(brandA.body.data.totalAlerts).toBeGreaterThanOrEqual(1);
    expect(brandB.body.data.totalAlerts).toBe(1);
    expect(brandB.body.data.affectedCampaigns).toBe(1);
    expect(brandB.body.data.affectedSubmissions).toBe(1);

    expect(brandA.body.data.recentAlerts.some(
      (alert: { campaignId: string }) => alert.campaignId === campaignB,
    )).toBe(false);

    expect(brandB.body.data.recentAlerts).toHaveLength(1);
    expect(brandB.body.data.recentAlerts[0]).toMatchObject({
      campaignId: campaignB,
      submissionId: submissionB,
      deltaViews: 100000,
      source: 'SPIKE_DEMO',
    });
  });

  test('insufficient campaign budget rolls back payouts, views and spike records', async () => {
    const campaignId = await createCampaign(
      brandToken,
      2000,
      [{ views: 100000, payout: 2000 }],
    );

    const firstSubmissionId = await createSubmission(creatorToken, campaignId);
    const secondSubmissionId = await createSubmission(secondCreatorToken, campaignId);

    const first = await simulateViews(creatorToken, firstSubmissionId, 100000, 'MILESTONE_DEMO');
    expect(first.status).toBe(200);
    expect(first.body.data.additionalPayout).toBe(2000);

    const rejected = await simulateViews(secondCreatorToken, secondSubmissionId, 100000, 'SPIKE_DEMO');
    expect(rejected.status).toBe(409);

    const campaign = await CampaignModel.findById(campaignId);
    const secondSubmission = await SubmissionModel.findById(secondSubmissionId);
    const secondPayouts = await PayoutModel.find({ submissionId: secondSubmissionId });
    const secondSpikes = await ViewSpikeModel.find({ submissionId: secondSubmissionId });

    expect(campaign?.budgetSpent).toBe(2000);
    expect(secondSubmission?.views).toBe(0);
    expect(secondSubmission?.paidAmount).toBe(0);
    expect(secondPayouts).toHaveLength(0);
    expect(secondSpikes).toHaveLength(0);
  });
});
