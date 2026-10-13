
import type { Types } from 'mongoose';

export type CampaignPlatform = 'instagram' | 'youtube';
export type CampaignStatus = 'live' | 'paused';

export interface CampaignMilestone {
  views: number;
  payout: number;
}

export interface CreateCampaignInput {
  name: string;
  platform: CampaignPlatform;
  totalBudget: number;
  milestones: CampaignMilestone[];
}

export interface Campaign {
  brandId: Types.ObjectId;
  name: string;
  platform: CampaignPlatform;
  totalBudget: number;
  budgetSpent: number;
  milestones: CampaignMilestone[];
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCampaignResponse {
  id: string;
  name: string;
  platform: CampaignPlatform;
  milestones: CampaignMilestone[];
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandCampaignResponse extends PublicCampaignResponse {
  totalBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
}
