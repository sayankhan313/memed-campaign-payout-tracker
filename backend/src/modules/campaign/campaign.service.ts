
import { isValidObjectId, Types, type HydratedDocument } from 'mongoose';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { UserModel } from '../auth/auth.model.js';
import { SubmissionModel } from '../submission/submission.model.js';
import { ViewSpikeModel } from '../payout/view-spike.model.js';
import { AppError } from '../../errors/app.error.js';
import { cacheGet, cacheSet, cacheDelete } from '../../lib/redis-cache.js';
import { CampaignModel } from './campaign.model.js';
import type { Campaign, CampaignAction, CampaignStatus, PublicCampaignResponse, BrandCampaignResponse, BrandCampaignSubmission } from './campaign.types.js';
import { validateCreateCampaign, validateUpdateCampaign, validateCampaignAction } from './campaign.validation.js';

type CampaignDocument = HydratedDocument<Campaign>;

type LatestSpikeRecord = {
  _id: Types.ObjectId;
  previousViews: number;
  newViews: number;
  deltaViews: number;
  source: 'SPIKE_DEMO' | 'SIMULATED_PLATFORM';
  reason: string;
  createdAt: Date;
};

export type BrandSpikeAnalyticsResponse = {
  totalAlerts: number;
  affectedCampaigns: number;
  affectedSubmissions: number;
  recentAlerts: {
    id: string;
    campaignId: string;
    campaignName: string;
    submissionId: string;
    creatorName: string;
    previousViews: number;
    newViews: number;
    deltaViews: number;
    source: string;
    reason: string;
    createdAt: Date;
  }[];
};

const LIVE_CAMPAIGNS_CACHE_KEY = 'campaigns:live';
const LIVE_CAMPAIGNS_CACHE_TTL = 15;

export async function invalidateLiveCampaignsCache(): Promise<void> {
  await cacheDelete(LIVE_CAMPAIGNS_CACHE_KEY);
}

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

  await invalidateLiveCampaignsCache();
  return formatBrandCampaign(campaign);
}

export async function getBrandCampaigns(brandId: string): Promise<BrandCampaignResponse[]> {
  const campaigns = await CampaignModel.find({
    brandId: new Types.ObjectId(brandId),
  }).sort({ createdAt: -1 }).limit(50).exec();

  return campaigns.map(formatBrandCampaign);
}

export async function getLiveCampaigns(): Promise<PublicCampaignResponse[]> {
  const cached = await cacheGet<PublicCampaignResponse[]>(LIVE_CAMPAIGNS_CACHE_KEY);
  if (cached !== null) return cached;

  const campaigns = await CampaignModel.find({
    status: 'live',
    $expr: { $lt: ['$budgetSpent', '$totalBudget'] },
  }).sort({ createdAt: -1 }).limit(50).exec();

  const result = campaigns.map(formatPublicCampaign);
  await cacheSet(LIVE_CAMPAIGNS_CACHE_KEY, result, LIVE_CAMPAIGNS_CACHE_TTL);
  return result;
}

export async function getCampaignDetails(
  campaignId: string,
  user: AuthenticatedUser,
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
  body: unknown,
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
    { returnDocument: 'after', runValidators: true },
  ).exec();

  if (!updated) throw new AppError('Only live or paused campaigns can be edited', 409);

  await invalidateLiveCampaignsCache();
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
  body: unknown,
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
    { returnDocument: 'after', runValidators: true },
  ).exec();

  if (!updated) {
    throw new AppError('Campaign status changed. Refresh and try again', 409);
  }

  await invalidateLiveCampaignsCache();
  return formatBrandCampaign(updated);
}

export async function getBrandCampaignSubmissions(
  campaignId: string,
  brandId: string,
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

  const [creators, latestSpikes] = await Promise.all([
    UserModel.find({
      _id: { $in: creatorIds },
      role: 'creator',
    })
      .select('name instagramUsername youtubeChannelUrl')
      .lean()
      .exec(),

    ViewSpikeModel.aggregate<LatestSpikeRecord>([
      {
        $match: {
          campaignId: new Types.ObjectId(campaignId),
          submissionId: { $in: submissions.map(submission => submission._id) },
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $group: {
          _id: '$submissionId',
          previousViews: { $first: '$previousViews' },
          newViews: { $first: '$newViews' },
          deltaViews: { $first: '$deltaViews' },
          source: { $first: '$source' },
          reason: { $first: '$reason' },
          createdAt: { $first: '$createdAt' },
        },
      },
    ]),
  ]);

  const creatorMap = new Map(creators.map(creator => [String(creator._id), creator]));
  const spikeMap = new Map(latestSpikes.map(spike => [String(spike._id), spike]));

  return submissions.map(submission => {
    const creatorId = String(submission.creatorId);
    const creator = creatorMap.get(creatorId);
    const latestSpike = spikeMap.get(String(submission._id));

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
      ...(latestSpike ? {
        latestSpike: {
          previousViews: latestSpike.previousViews,
          newViews: latestSpike.newViews,
          deltaViews: latestSpike.deltaViews,
          source: latestSpike.source,
          reason: latestSpike.reason,
          createdAt: latestSpike.createdAt,
        },
      } : {}),
    };
  });
}

export async function getBrandSpikeAnalytics(brandId: string): Promise<BrandSpikeAnalyticsResponse> {
  const campaigns = await CampaignModel.find({
    brandId: new Types.ObjectId(brandId),
  })
    .select('_id name')
    .lean()
    .exec();

  if (campaigns.length === 0) {
    return { totalAlerts: 0, affectedCampaigns: 0, affectedSubmissions: 0, recentAlerts: [] };
  }

  const campaignIds = campaigns.map(campaign => campaign._id);

  const [summaryResults, recentSpikes] = await Promise.all([
    ViewSpikeModel.aggregate<{
      totalAlerts: number;
      affectedCampaigns: number;
      affectedSubmissions: number;
    }>([
      { $match: { campaignId: { $in: campaignIds } } },
      {
        $group: {
          _id: null,
          totalAlerts: { $sum: 1 },
          campaignIds: { $addToSet: '$campaignId' },
          submissionIds: { $addToSet: '$submissionId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalAlerts: 1,
          affectedCampaigns: { $size: '$campaignIds' },
          affectedSubmissions: { $size: '$submissionIds' },
        },
      },
    ]),

    ViewSpikeModel.find({
      campaignId: { $in: campaignIds },
    })
      .select('campaignId creatorId submissionId previousViews newViews deltaViews source reason createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec(),
  ]);

  const summary = summaryResults[0];

  if (recentSpikes.length === 0) {
    return {
      totalAlerts: summary?.totalAlerts ?? 0,
      affectedCampaigns: summary?.affectedCampaigns ?? 0,
      affectedSubmissions: summary?.affectedSubmissions ?? 0,
      recentAlerts: [],
    };
  }

  const creatorIds = [...new Set(recentSpikes.map(spike => String(spike.creatorId)))];

  const creators = await UserModel.find({
    _id: { $in: creatorIds },
    role: 'creator',
  })
    .select('name')
    .lean()
    .exec();

  const campaignMap = new Map(campaigns.map(campaign => [String(campaign._id), campaign.name]));
  const creatorMap = new Map(creators.map(creator => [String(creator._id), creator.name]));

  return {
    totalAlerts: summary?.totalAlerts ?? 0,
    affectedCampaigns: summary?.affectedCampaigns ?? 0,
    affectedSubmissions: summary?.affectedSubmissions ?? 0,
    recentAlerts: recentSpikes.map(spike => ({
      id: String(spike._id),
      campaignId: String(spike.campaignId),
      campaignName: campaignMap.get(String(spike.campaignId)) ?? 'Unknown Campaign',
      submissionId: String(spike.submissionId),
      creatorName: creatorMap.get(String(spike.creatorId)) ?? 'Unknown Creator',
      previousViews: spike.previousViews,
      newViews: spike.newViews,
      deltaViews: spike.deltaViews,
      source: spike.source,
      reason: spike.reason,
      createdAt: spike.createdAt,
    })),
  };
}
