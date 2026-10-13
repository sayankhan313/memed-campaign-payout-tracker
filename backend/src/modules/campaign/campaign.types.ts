
import type { Types } from 'mongoose';

export type CampaignPlatform = 'instagram' | 'youtube';
export type CampaignStatus = 'live' | 'paused' | 'completed' | 'archived';
export type CampaignAction = 'pause' | 'resume' | 'complete' | 'archive';

export interface CampaignMilestone {
  views: number;
  payout: number;
}

export interface CreateCampaignInput {
  name: string;
  description: string;
  platform: CampaignPlatform;
  totalBudget: number;
  milestones: CampaignMilestone[];
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
}

export interface Campaign {
  brandId: Types.ObjectId;
  name: string;
  description: string;
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
  description: string;
  platform: CampaignPlatform;
  milestones: CampaignMilestone[];
  status: CampaignStatus;
  budgetExhausted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandCampaignResponse extends PublicCampaignResponse {
  totalBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
}

export interface BrandCampaignCreator {
  id: string;
  name: string;
  instagramUsername?: string;
  youtubeChannelUrl?: string;
}

export interface BrandCampaignSubmission {
  id: string;
  campaignId: string;
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
  creator: BrandCampaignCreator;
}
