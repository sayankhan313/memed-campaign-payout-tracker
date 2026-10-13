
import { Schema, model } from 'mongoose';
import type { Campaign, CampaignMilestone } from './campaign.types.js';

const milestoneSchema = new Schema<CampaignMilestone>({
  views: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger,
  },
  payout: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger,
  },
}, { _id: false });

const campaignSchema = new Schema<Campaign>({
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  platform: {
    type: String,
    enum: ['instagram', 'youtube'],
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger,
  },
  budgetSpent: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger,
  },
  milestones: {
    type: [milestoneSchema],
    required: true,
    validate: {
      validator: (value: CampaignMilestone[]) => value.length >= 1 && value.length <= 10,
      message: 'Campaign must contain between 1 and 10 milestones',
    },
  },
  status: {
    type: String,
    enum: ['live', 'paused', 'completed', 'archived'],
    default: 'live',
    required: true,
  },
}, { timestamps: true });

campaignSchema.index({ brandId: 1, createdAt: -1 });
campaignSchema.index({ status: 1, createdAt: -1 });

export const CampaignModel = model<Campaign>('Campaign', campaignSchema);
