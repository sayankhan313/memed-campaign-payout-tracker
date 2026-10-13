
import { AppError } from '../../errors/app.error.js';
import type { CampaignMilestone, CreateCampaignInput } from './campaign.types.js';

export function validateCreateCampaign(body: unknown): CreateCampaignInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Invalid campaign details', 400);
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const platform = input.platform;
  const totalBudget = input.totalBudget;

  if (name.length < 3 || name.length > 100) {
    throw new AppError('Campaign name must be between 3 and 100 characters', 400);
  }

  if (platform !== 'instagram' && platform !== 'youtube') {
    throw new AppError('Platform must be Instagram or YouTube', 400);
  }

  if (typeof totalBudget !== 'number' || !Number.isSafeInteger(totalBudget) || totalBudget <= 0) {
    throw new AppError('Total budget must be a positive integer', 400);
  }

  if (!Array.isArray(input.milestones) || input.milestones.length < 1 || input.milestones.length > 10) {
    throw new AppError('Campaign must contain between 1 and 10 milestones', 400);
  }

  const milestones: CampaignMilestone[] = input.milestones.map((milestone: unknown, index: number) => {
    if (!milestone || typeof milestone !== 'object' || Array.isArray(milestone)) {
      throw new AppError(`Milestone ${index + 1} is invalid`, 400);
    }

    const item = milestone as Record<string, unknown>;
    const views = item.views;
    const payout = item.payout;

    if (typeof views !== 'number' || !Number.isSafeInteger(views) || views <= 0) {
      throw new AppError(`Milestone ${index + 1} requires a positive view threshold`, 400);
    }

    if (typeof payout !== 'number' || !Number.isSafeInteger(payout) || payout <= 0) {
      throw new AppError(`Milestone ${index + 1} requires a positive payout`, 400);
    }

    if (payout > totalBudget) {
      throw new AppError(`Milestone ${index + 1} payout cannot exceed the campaign budget`, 400);
    }

    return { views, payout };
  });

  for (let index = 1; index < milestones.length; index++) {
    const previous = milestones[index - 1];
    const current = milestones[index];

    if (current.views <= previous.views) {
      throw new AppError('Milestone view thresholds must be strictly increasing', 400);
    }

    if (current.payout <= previous.payout) {
      throw new AppError('Milestone payouts must be strictly increasing', 400);
    }
  }

  return { name, platform, totalBudget, milestones };
}
