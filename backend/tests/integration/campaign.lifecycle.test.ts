import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/auth/auth.model.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { SubmissionModel } from '../../src/modules/submission/submission.model.js';
import { PayoutModel } from '../../src/modules/payout/payout.model.js';

const unique = `${Date.now()}-${process.pid}`;
const emails = [`campaign.brand.${unique}@example.com`, `campaign.creator.${unique}@example.com`, `campaign.other.${unique}@example.com`];
const campaignIds: string[] = [];
const password = 'SecureTest123!';
let brandToken = '';
let creatorToken = '';
let otherToken = '';
let campaignId = '';
let submissionId = '';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) throw new Error('MONGODB_TEST_URI is required');
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName: 'memed_assignment_jest', serverSelectionTimeoutMS: 15000 });
  if (mongoose.connection.name !== 'memed_assignment_jest') throw new Error('Unsafe test database configuration');
  const roles = ['brand', 'creator', 'brand'];
  const tokens: string[] = [];
  for (let i = 0; i < roles.length; i++) {
    const response = await request(app).post('/api/auth/signup').send({ name: `Campaign Tester ${i}`, email: emails[i], password, role: roles[i] });
    if (response.status !== 201) throw new Error(`Unable to register test account: ${response.body.message}`);
    tokens.push(response.body.data.accessToken);
  }
  [brandToken, creatorToken, otherToken] = tokens;
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await PayoutModel.deleteMany({ campaignId: { $in: campaignIds } });
    await SubmissionModel.deleteMany({ campaignId: { $in: campaignIds } });
    await CampaignModel.deleteMany({ _id: { $in: campaignIds } });
    await UserModel.deleteMany({ email: { $in: emails } });
  } finally { await mongoose.disconnect(); }
});

describe('Campaign Description and Lifecycle', () => {
  test('Brand creates a campaign with a Creator-facing description', async () => {
    const response = await request(app).post('/api/campaigns').set('Authorization', `Bearer ${brandToken}`).send({
      name: 'Creator Launch', description: 'Create an Instagram Reel showing our newest sneaker designs.',
      platform: 'instagram', totalBudget: 1000,
      milestones: [{ views: 10000, payout: 500 }, { views: 20000, payout: 1000 }],
    });
    expect(response.status).toBe(201);
    expect(response.body.data.description).toContain('Instagram Reel');
    campaignId = response.body.data.id;
    campaignIds.push(campaignId);
  });

  test('Creator sees instructions without private Brand budget', async () => {
    const response = await request(app).get(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${creatorToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data.description).toContain('Instagram Reel');
    expect(response.body.data).not.toHaveProperty('totalBudget');
    expect(response.body.data).not.toHaveProperty('budgetSpent');
  });

  test('Brand can only edit the name and creative brief', async () => {
    const forbiddenFields = await request(app).patch(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${brandToken}`).send({ totalBudget: 100000 });
    expect(forbiddenFields.status).toBe(400);
    const response = await request(app).patch(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${brandToken}`).send({ name: 'Updated Creator Launch', description: 'Show the new sneakers clearly with a fun outfit video.' });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Creator Launch');
    expect(response.body.data.totalBudget).toBe(1000);
  });

  test('Other Brand and Creator cannot manage this campaign', async () => {
    const other = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${otherToken}`).send({ action: 'pause' });
    expect(other.status).toBe(404);
    const creator = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${creatorToken}`).send({ action: 'pause' });
    expect(creator.status).toBe(403);
  });

  test('Creator creates a submission while the campaign is live', async () => {
    const response = await request(app).post('/api/submissions').set('Authorization', `Bearer ${creatorToken}`).send({ campaignId, postUrl: `https://www.instagram.com/reel/LIFECYCLE${Date.now()}A/` });
    expect(response.status).toBe(201);
    submissionId = response.body.data.id;
  });

  test('Pausing hides campaign and rejects new submissions', async () => {
    const pause = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brandToken}`).send({ action: 'pause' });
    expect(pause.status).toBe(200);
    expect(pause.body.data.status).toBe('paused');
    const live = await request(app).get('/api/campaigns/live').set('Authorization', `Bearer ${creatorToken}`);
    expect(live.body.data.some((item: { id: string }) => item.id === campaignId)).toBe(false);
    const submit = await request(app).post('/api/submissions').set('Authorization', `Bearer ${creatorToken}`).send({ campaignId, postUrl: `https://www.instagram.com/reel/LIFECYCLE${Date.now()}B/` });
    expect(submit.status).toBe(409);
  });

  test('Existing Creator can still earn first milestone while paused', async () => {
    const payout = await request(app).patch(`/api/submissions/${submissionId}/views`).send({ views: 10000 });
    expect(payout.status).toBe(200);
    expect(payout.body.data.additionalPayout).toBe(500);
  });

  test('Brand resumes and then completes the campaign', async () => {
    const resume = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brandToken}`).send({ action: 'resume' });
    expect(resume.status).toBe(200);
    expect(resume.body.data.status).toBe('live');
    const complete = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brandToken}`).send({ action: 'complete' });
    expect(complete.status).toBe(200);
    expect(complete.body.data.status).toBe('completed');
    const submit = await request(app).post('/api/submissions').set('Authorization', `Bearer ${creatorToken}`).send({ campaignId, postUrl: `https://www.instagram.com/reel/LIFECYCLE${Date.now()}C/` });
    expect(submit.status).toBe(409);
  });

  test('Completed campaigns can settle remaining earned milestones', async () => {
    const payout = await request(app).patch(`/api/submissions/${submissionId}/views`).send({ views: 20000 });
    expect(payout.status).toBe(200);
    expect(payout.body.data.additionalPayout).toBe(500);
    const details = await request(app).get(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${brandToken}`);
    expect(details.body.data.budgetExhausted).toBe(true);
    expect(details.body.data.budgetSpent).toBe(1000);
  });

  test('Archived campaigns remain readable but cannot process new rewards or edits', async () => {
    const archived = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brandToken}`).send({ action: 'archive' });
    expect(archived.status).toBe(200);
    expect(archived.body.data.status).toBe('archived');
    const payout = await request(app).patch(`/api/submissions/${submissionId}/views`).send({ views: 30000 });
    expect(payout.status).toBe(409);
    const edit = await request(app).patch(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${brandToken}`).send({ name: 'Should Not Change' });
    expect(edit.status).toBe(409);
    const details = await request(app).get(`/api/campaigns/${campaignId}`).set('Authorization', `Bearer ${brandToken}`);
    expect(details.status).toBe(200);
    expect(details.body.data.status).toBe('archived');
    const invalidResume = await request(app).patch(`/api/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brandToken}`).send({ action: 'resume' });
    expect(invalidResume.status).toBe(409);
  });

  test('Campaign with an exhausted budget is hidden from Creator live discovery', async () => {
    const created = await request(app).post('/api/campaigns').set('Authorization', `Bearer ${brandToken}`).send({ name: 'Small Budget Campaign', platform: 'instagram', totalBudget: 500, milestones: [{ views: 10000, payout: 500 }] });
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    campaignIds.push(id);
    const submission = await request(app).post('/api/submissions').set('Authorization', `Bearer ${creatorToken}`).send({ campaignId: id, postUrl: `https://www.instagram.com/reel/LIFECYCLE${Date.now()}D/` });
    expect(submission.status).toBe(201);
    const payout = await request(app).patch(`/api/submissions/${submission.body.data.id}/views`).send({ views: 10000 });
    expect(payout.status).toBe(200);
    const live = await request(app).get('/api/campaigns/live').set('Authorization', `Bearer ${creatorToken}`);
    expect(live.body.data.some((item: { id: string }) => item.id === id)).toBe(false);
    const repeat = await request(app).post('/api/submissions').set('Authorization', `Bearer ${creatorToken}`).send({ campaignId: id, postUrl: `https://www.instagram.com/reel/LIFECYCLE${Date.now()}E/` });
    expect(repeat.status).toBe(409);
  });
});
