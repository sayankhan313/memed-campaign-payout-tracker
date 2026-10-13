
import mongoose, { Types } from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { SubmissionModel } from '../../src/modules/submission/submission.model.js';
import { PayoutModel } from '../../src/modules/payout/payout.model.js';

const campaignIds: Types.ObjectId[] = [];

beforeAll(async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error('MONGODB_TEST_URI is required');
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
    await PayoutModel.deleteMany({ campaignId: { $in: campaignIds } });
    await SubmissionModel.deleteMany({ campaignId: { $in: campaignIds } });
    await CampaignModel.deleteMany({ _id: { $in: campaignIds } });
  } finally {
    await mongoose.disconnect();
  }
});

async function createTestCampaign(submissionCount: number) {
  const campaign = await CampaignModel.create({
    brandId: new Types.ObjectId(),
    name: 'Concurrent Payout Test',
    platform: 'instagram',
    totalBudget: 1000,
    budgetSpent: 0,
    milestones: [{ views: 10000, payout: 1000 }],
    status: 'live',
  });

  campaignIds.push(campaign._id);

  const submissions = await SubmissionModel.create(
    Array.from({ length: submissionCount }, (_, index) => ({
      campaignId: campaign._id,
      creatorId: new Types.ObjectId(),
      postUrl: `https://www.instagram.com/reel/${campaign._id}${index}/`,
      views: 0,
      paidAmount: 0,
    }))
  );

  return { campaign, submissions };
}

describe('Concurrent Payout Protection', () => {
  test('two different submissions cannot overspend the same campaign', async () => {
    const { campaign, submissions } = await createTestCampaign(2);

    const responses = await Promise.all(
      submissions.map(submission =>
        request(app)
          .patch(`/api/submissions/${submission._id}/views`)
          .send({ views: 10000 })
      )
    );

    const statuses = responses.map(response => response.status).sort();
    expect(statuses).toEqual([200, 409]);

    const storedCampaign = await CampaignModel.findById(campaign._id);
    const storedSubmissions = await SubmissionModel.find({ campaignId: campaign._id });
    const ledgerEntries = await PayoutModel.find({ campaignId: campaign._id });

    expect(storedCampaign?.budgetSpent).toBe(1000);
    expect(storedCampaign!.totalBudget - storedCampaign!.budgetSpent).toBe(0);
    expect(storedSubmissions.map(item => item.paidAmount).sort((a, b) => a - b)).toEqual([0, 1000]);
    expect(storedSubmissions.map(item => item.views).sort((a, b) => a - b)).toEqual([0, 10000]);
    expect(ledgerEntries).toHaveLength(1);
    expect(ledgerEntries[0].amount).toBe(1000);
  });

  test('simultaneous updates to the same submission never double-pay', async () => {
    const { campaign, submissions } = await createTestCampaign(1);
    const submissionId = String(submissions[0]._id);

    const responses = await Promise.all([
      request(app).patch(`/api/submissions/${submissionId}/views`).send({ views: 10000 }),
      request(app).patch(`/api/submissions/${submissionId}/views`).send({ views: 10000 }),
    ]);

    expect(responses.map(response => response.status).sort()).toEqual([200, 200]);
    expect(responses.map(response => response.body.data.additionalPayout).sort((a: number, b: number) => a - b)).toEqual([0, 1000]);

    const storedCampaign = await CampaignModel.findById(campaign._id);
    const storedSubmission = await SubmissionModel.findById(submissionId);
    const ledgerEntries = await PayoutModel.find({ campaignId: campaign._id });

    expect(storedCampaign?.budgetSpent).toBe(1000);
    expect(storedSubmission?.paidAmount).toBe(1000);
    expect(storedSubmission?.views).toBe(10000);
    expect(ledgerEntries).toHaveLength(1);
    expect(ledgerEntries[0].amount).toBe(1000);
  });
});
