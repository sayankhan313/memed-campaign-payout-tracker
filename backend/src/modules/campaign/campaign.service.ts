
import { isValidObjectId, Types, type HydratedDocument } from 'mongoose';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { UserModel } from '../auth/auth.model.js';
import { SubmissionModel } from '../submission/submission.model.js';
import { AppError } from '../../errors/app.error.js';
import { CampaignModel } from './campaign.model.js';
import type {
  Campaign,
  CampaignAction,
  CampaignStatus,
  PublicCampaignResponse,
  BrandCampaignResponse,
  BrandCampaignSubmission,
} from './campaign.types.js';
import {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCampaignAction,
} from './campaign.validation.js';

type CampaignDocument = HydratedDocument<Campaign>;

function formatPublicCampaign(campaign: CampaignDocument): PublicCampaignResponse {
  return {
    id: String(campaign._id),
    name: campaign.name,
    description: campaign.description ?? '',
    platform: campaign.platform,
    milestones: campaign.milestones,
    status: campaign.status,
    budgetExhausted: campaign.budgetSpent >= campaign.totalBudget,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

function formatBrandCampaign(campaign: CampaignDocument): BrandCampaignResponse {
  return {
    ...formatPublicCampaign(campaign),
    totalBudget: campaign.totalBudget,
    budgetSpent: campaign.budgetSpent,
    budgetRemaining: Math.max(0, campaign.totalBudget - campaign.budgetSpent),
  };
}

function validateId(id: string): void {
  if (!isValidObjectId(id)) throw new AppError('Invalid campaign ID', 400);
}

async function getOwnedCampaign(campaignId: string, brandId: string): Promise<CampaignDocument> {
  validateId(campaignId);

  const campaign = await CampaignModel.findOne({
    _id: campaignId,
    brandId: new Types.ObjectId(brandId),
  }).exec();

  if (!campaign) throw new AppError('Campaign not found', 404);
  return campaign;
}

export async function createCampaign(brandId: string, body: unknown): Promise<BrandCampaignResponse> {
  const input = validateCreateCampaign(body);

  const campaign = await CampaignModel.create({
    brandId: new Types.ObjectId(brandId),
    name: input.name,
    description: input.description,
    platform: input.platform,
    totalBudget: input.totalBudget,
    budgetSpent: 0,
    milestones: input.milestones,
    status: 'live',
  });

  return formatBrandCampaign(campaign);
}

export async function getBrandCampaigns(brandId: string): Promise<BrandCampaignResponse[]> {
  const campaigns = await CampaignModel.find({
    brandId: new Types.ObjectId(brandId),
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .exec();

  return campaigns.map(formatBrandCampaign);
}

export async function getLiveCampaigns(): Promise<PublicCampaignResponse[]> {
  const campaigns = await CampaignModel.find({
    status: 'live',
    $expr: { $lt: ['$budgetSpent', '$totalBudget'] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .exec();

  return campaigns.map(formatPublicCampaign);
}

export async function getCampaignDetails(
  campaignId: string,
  user: AuthenticatedUser
): Promise<PublicCampaignResponse | BrandCampaignResponse> {
  validateId(campaignId);

  if (user.role === 'brand') {
    return formatBrandCampaign(await getOwnedCampaign(campaignId, user.id));
  }

  const campaign = await CampaignModel.findOne({
    _id: campaignId,
    status: 'live',
    $expr: { $lt: ['$budgetSpent', '$totalBudget'] },
  }).exec();

  if (!campaign) throw new AppError('Campaign not found', 404);
  return formatPublicCampaign(campaign);
}

export async function updateCampaignDetails(
  campaignId: string,
  brandId: string,
  body: unknown
): Promise<BrandCampaignResponse> {
  const input = validateUpdateCampaign(body);
  await getOwnedCampaign(campaignId, brandId);

  const updated = await CampaignModel.findOneAndUpdate(
    {
      _id: campaignId,
      brandId: new Types.ObjectId(brandId),
      status: { $in: ['live', 'paused'] },
    },
    { $set: input },
    { returnDocument: 'after', runValidators: true }
  ).exec();

  if (!updated) throw new AppError('Only live or paused campaigns can be edited', 409);
  return formatBrandCampaign(updated);
}

const transitions: Record<CampaignAction, { from: CampaignStatus[]; to: CampaignStatus }> = {
  pause: { from: ['live'], to: 'paused' },
  resume: { from: ['paused'], to: 'live' },
  complete: { from: ['live', 'paused'], to: 'completed' },
  archive: { from: ['completed'], to: 'archived' },
};

export async function transitionCampaign(
  campaignId: string,
  brandId: string,
  body: unknown
): Promise<BrandCampaignResponse> {
  const action = validateCampaignAction(body);
  const campaign = await getOwnedCampaign(campaignId, brandId);
  const transition = transitions[action];

  if (!transition.from.includes(campaign.status)) {
    throw new AppError(`Cannot ${action} a ${campaign.status} campaign`, 409);
  }

  if (action === 'resume' && campaign.budgetSpent >= campaign.totalBudget) {
    throw new AppError('Cannot resume a campaign with exhausted budget', 409);
  }

  const filter: Record<string, unknown> = {
    _id: campaignId,
    brandId: new Types.ObjectId(brandId),
    status: { $in: transition.from },
  };

  if (action === 'resume') {
    filter.$expr = { $lt: ['$budgetSpent', '$totalBudget'] };
  }

  const updated = await CampaignModel.findOneAndUpdate(
    filter,
    { $set: { status: transition.to } },
    { returnDocument: 'after', runValidators: true }
  ).exec();

  if (!updated) {
    throw new AppError('Campaign status changed. Refresh and try again', 409);
  }

  return formatBrandCampaign(updated);
}

export async function getBrandCampaignSubmissions(
  campaignId: string,
  brandId: string
): Promise<BrandCampaignSubmission[]> {
  await getOwnedCampaign(campaignId, brandId);

  const submissions = await SubmissionModel.find({
    campaignId: new Types.ObjectId(campaignId),
  })
    .select('campaignId creatorId postUrl views paidAmount createdAt updatedAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
    .exec();

  if (submissions.length === 0) return [];

  const creatorIds = [...new Set(submissions.map(submission => String(submission.creatorId)))];

  const creators = await UserModel.find({
    _id: { $in: creatorIds },
    role: 'creator',
  })
    .select('name instagramUsername youtubeChannelUrl')
    .lean()
    .exec();

  const creatorMap = new Map(creators.map(creator => [String(creator._id), creator]));

  return submissions.map(submission => {
    const creatorId = String(submission.creatorId);
    const creator = creatorMap.get(creatorId);

    return {
      id: String(submission._id),
      campaignId: String(submission.campaignId),
      postUrl: submission.postUrl,
      views: submission.views,
      paidAmount: submission.paidAmount,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      creator: {
        id: creatorId,
        name: creator?.name ?? 'Unknown Creator',
        ...(creator?.instagramUsername ? { instagramUsername: creator.instagramUsername } : {}),
        ...(creator?.youtubeChannelUrl ? { youtubeChannelUrl: creator.youtubeChannelUrl } : {}),
      },
    };
  });
}
