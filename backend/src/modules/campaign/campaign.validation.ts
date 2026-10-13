
import { z } from 'zod';
import { AppError } from '../../errors/app.error.js';
import type { CreateCampaignInput } from './campaign.types.js';

const milestoneSchema = z.object({
  views: z.number().int().positive('View threshold must be positive'),
  payout: z.number().int().positive('Payout must be positive'),
});

const campaignSchema = z.object({
  name: z.preprocess(
    value => typeof value === 'string' ? value.trim() : '',
    z.string().min(3, 'Campaign name must be between 3 and 100 characters').max(100, 'Campaign name must be between 3 and 100 characters')
  ),
  platform: z.enum(['instagram', 'youtube'], { error: 'Platform must be Instagram or YouTube' }),
  totalBudget: z.number().int().positive('Total budget must be a positive integer'),
  milestones: z.array(milestoneSchema)
    .min(1, 'Campaign must contain between 1 and 10 milestones')
    .max(10, 'Campaign must contain between 1 and 10 milestones'),
}).superRefine((campaign, ctx) => {
  for (let index = 0; index < campaign.milestones.length; index++) {
    const milestone = campaign.milestones[index];
    const previous = campaign.milestones[index - 1];

    if (milestone.payout > campaign.totalBudget) {
      ctx.addIssue({
        code: 'custom',
        path: ['milestones', index, 'payout'],
        message: `Milestone ${index + 1} payout cannot exceed the campaign budget`,
      });
    }

    if (previous && milestone.views <= previous.views) {
      ctx.addIssue({
        code: 'custom',
        path: ['milestones', index, 'views'],
        message: 'Milestone view thresholds must be strictly increasing',
      });
    }

    if (previous && milestone.payout <= previous.payout) {
      ctx.addIssue({
        code: 'custom',
        path: ['milestones', index, 'payout'],
        message: 'Milestone payouts must be strictly increasing',
      });
    }
  }
});

export function validateCreateCampaign(body: unknown): CreateCampaignInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Invalid campaign details', 400);
  }

  const result = campaignSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? 'Invalid campaign details', 400);
  }

  return result.data;
}
