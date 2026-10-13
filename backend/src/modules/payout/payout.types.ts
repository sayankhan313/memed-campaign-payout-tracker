
import type { Types } from 'mongoose';

export interface PayoutLedgerEntry {
  campaignId: Types.ObjectId;
  submissionId: Types.ObjectId;
  creatorId: Types.ObjectId;
  milestonePayout: number;
  amount: number;
  createdAt: Date;
}

export interface UpdateViewsInput {
  views: number;
}

export interface UpdateViewsResponse {
  submissionId: string;
  campaignId: string;
  views: number;
  totalEarned: number;
  additionalPayout: number;
  campaignBudgetRemaining: number;
}

export interface CreatorEarningsResponse {
  totalEarnings: number;
  totalSubmissions: number;
}
