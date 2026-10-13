
import mongoose, { isValidObjectId, Types } from 'mongoose';
import { AppError } from '../../errors/app.error.js';
import { CampaignModel } from '../campaign/campaign.model.js';
import type { CampaignMilestone } from '../campaign/campaign.types.js';
import { SubmissionModel } from '../submission/submission.model.js';
import { PayoutModel } from './payout.model.js';
import type {
  UpdateViewsResponse,
  CreatorEarningsResponse,
} from './payout.types.js';
import { validateUpdateViews } from './payout.validation.js';

export function calculateHighestMilestonePayout(
  milestones: readonly CampaignMilestone[],
  views: number
): number {
  return milestones.reduce((highest, milestone) => {
    return views >= milestone.views ? Math.max(highest, milestone.payout) : highest;
  }, 0);
}

export function calculateAdditionalPayout(
  targetPayout: number,
  alreadyPaid: number
): number {
  return Math.max(0, targetPayout - alreadyPaid);
}

export function hasEnoughBudget(
  totalBudget: number,
  budgetSpent: number,
  additionalPayout: number
): boolean {
  return additionalPayout >= 0 &&
    budgetSpent >= 0 &&
    budgetSpent <= totalBudget &&
    additionalPayout <= totalBudget - budgetSpent;
}

export async function updateSubmissionViews(
  submissionId: string,
  body: unknown
): Promise<UpdateViewsResponse> {
  if (!isValidObjectId(submissionId)) {
    throw new AppError('Invalid submission ID', 400);
  }

  const { views } = validateUpdateViews(body);
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const submission = await SubmissionModel.findById(submissionId).session(session);

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      if (views < submission.views) {
        throw new AppError('View count cannot decrease', 409);
      }

      const campaign = await CampaignModel.findById(submission.campaignId).session(session);

      if (!campaign) {
        throw new AppError('Campaign not found', 404);
      }

      if (!['live', 'paused', 'completed'].includes(campaign.status)) {
        throw new AppError('Archived campaigns no longer process payouts', 409);
      }

      const targetPayout = calculateHighestMilestonePayout(campaign.milestones, views);
      const additionalPayout = calculateAdditionalPayout(targetPayout, submission.paidAmount);

      if (!hasEnoughBudget(campaign.totalBudget, campaign.budgetSpent, additionalPayout)) {
        throw new AppError('Insufficient campaign budget for this payout', 409);
      }

      if (additionalPayout > 0) {
        const updatedCampaign = await CampaignModel.updateOne(
          {
            _id: campaign._id,
            status: { $in: ['live', 'paused', 'completed'] },
            budgetSpent: { $lte: campaign.totalBudget - additionalPayout },
          },
          { $inc: { budgetSpent: additionalPayout } },
          { session }
        );

        if (updatedCampaign.modifiedCount !== 1) {
          throw new AppError('Insufficient campaign budget for this payout', 409);
        }

        await PayoutModel.create([{
          campaignId: campaign._id,
          submissionId: submission._id,
          creatorId: submission.creatorId,
          milestonePayout: targetPayout,
          amount: additionalPayout,
          createdAt: new Date(),
        }], { session });
      }

      submission.views = views;
      submission.paidAmount = targetPayout;

      await submission.save({ session });

      return {
        submissionId: String(submission._id),
        campaignId: String(campaign._id),
        views: submission.views,
        totalEarned: submission.paidAmount,
        additionalPayout,
        campaignBudgetRemaining: campaign.totalBudget - campaign.budgetSpent - additionalPayout,
      };
    });

    if (!result) {
      throw new AppError('View update could not be completed', 503);
    }

    return result;
  } finally {
    await session.endSession();
  }
}

export async function getCreatorEarnings(
  creatorId: string
): Promise<CreatorEarningsResponse> {
  const [summary] = await SubmissionModel.aggregate<{
    totalEarnings: number;
    totalSubmissions: number;
  }>([
    { $match: { creatorId: new Types.ObjectId(creatorId) } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$paidAmount' },
        totalSubmissions: { $sum: 1 },
      },
    },
  ]);

  return {
    totalEarnings: summary?.totalEarnings ?? 0,
    totalSubmissions: summary?.totalSubmissions ?? 0,
  };
}
