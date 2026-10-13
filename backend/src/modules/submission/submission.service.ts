
import { Types, type HydratedDocument } from 'mongoose';
import { AppError } from '../../errors/app.error.js';
import { CampaignModel } from '../campaign/campaign.model.js';
import { SubmissionModel } from './submission.model.js';
import type { Submission, SubmissionResponse } from './submission.types.js';
import { detectPostPlatform, validateCreateSubmission } from './submission.validation.js';

type SubmissionDocument = HydratedDocument<Submission>;

function formatSubmission(submission: SubmissionDocument): SubmissionResponse {
  return {
    id: String(submission._id),
    campaignId: String(submission.campaignId),
    postUrl: submission.postUrl,
    views: submission.views,
    paidAmount: submission.paidAmount,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

export async function createSubmission(creatorId: string, body: unknown): Promise<SubmissionResponse> {
  const input = validateCreateSubmission(body);
  const campaign = await CampaignModel.findById(input.campaignId).select('status platform').exec();

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (campaign.status !== 'live') {
    throw new AppError('This campaign is not accepting submissions', 409);
  }

  if (detectPostPlatform(input.postUrl) !== campaign.platform) {
    throw new AppError('Post platform does not match the campaign platform', 400);
  }

  try {
    const submission = await SubmissionModel.create({
      campaignId: new Types.ObjectId(input.campaignId),
      creatorId: new Types.ObjectId(creatorId),
      postUrl: input.postUrl,
      views: 0,
      paidAmount: 0,
    });

    return formatSubmission(submission);
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'code' in error && error.code === 11000) {
      throw new AppError('This post has already been submitted to this campaign', 409);
    }

    throw error;
  }
}

export async function getCreatorSubmissions(creatorId: string): Promise<SubmissionResponse[]> {
  const submissions = await SubmissionModel.find({
    creatorId: new Types.ObjectId(creatorId),
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .exec();

  return submissions.map(formatSubmission);
}
