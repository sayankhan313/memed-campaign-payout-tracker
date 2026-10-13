
import { isValidObjectId, Types, type HydratedDocument } from 'mongoose';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { AppError } from '../../errors/app.error.js';
import { CampaignModel } from './campaign.model.js';
import type {
  Campaign,
  PublicCampaignResponse,
  BrandCampaignResponse,
} from './campaign.types.js';
import { validateCreateCampaign } from './campaign.validation.js';

type CampaignDocument = HydratedDocument<Campaign>;

function formatPublicCampaign(campaign: CampaignDocument): PublicCampaignResponse {
  return {
    id: String(campaign._id),
    name: campaign.name,
    platform: campaign.platform,
    milestones: campaign.milestones,
    status: campaign.status,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

function formatBrandCampaign(campaign: CampaignDocument): BrandCampaignResponse {
  return {
    ...formatPublicCampaign(campaign),
    totalBudget: campaign.totalBudget,
    budgetSpent: campaign.budgetSpent,
    budgetRemaining: campaign.totalBudget - campaign.budgetSpent,
  };
}

export async function createCampaign(
  brandId: string,
  body: unknown
): Promise<BrandCampaignResponse> {
  const input = validateCreateCampaign(body);

  const campaign = await CampaignModel.create({
    brandId: new Types.ObjectId(brandId),
    name: input.name,
    platform: input.platform,
    totalBudget: input.totalBudget,
    budgetSpent: 0,
    milestones: input.milestones,
    status: 'live',
  });

  return formatBrandCampaign(campaign);
}

export async function getBrandCampaigns(
  brandId: string
): Promise<BrandCampaignResponse[]> {
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
  if (!isValidObjectId(campaignId)) {
    throw new AppError('Invalid campaign ID', 400);
  }

  if (user.role === 'brand') {
    const campaign = await CampaignModel.findOne({
      _id: campaignId,
      brandId: user.id,
    }).exec();

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    return formatBrandCampaign(campaign);
  }

  const campaign = await CampaignModel.findOne({
    _id: campaignId,
    status: 'live',
  }).exec();

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  return formatPublicCampaign(campaign);
}
