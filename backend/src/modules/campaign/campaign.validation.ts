import { z } from 'zod';
import { AppError } from '../../errors/app.error.js';
import type { CampaignAction, CreateCampaignInput, UpdateCampaignInput } from './campaign.types.js';

const nameSchema = z.string().trim().min(3, 'Campaign name must be between 3 and 100 characters').max(100, 'Campaign name must be between 3 and 100 characters');
const descriptionSchema = z.string().trim().max(1000, 'Campaign description cannot exceed 1000 characters');
const milestoneSchema = z.object({
  views: z.number().int().positive('View threshold must be positive'),
  payout: z.number().int().positive('Payout must be positive'),
});

const campaignSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional().default(''),
  platform: z.enum(['instagram', 'youtube'], { error: 'Platform must be Instagram or YouTube' }),
  totalBudget: z.number().int().positive('Total budget must be a positive integer'),
  milestones: z.array(milestoneSchema).min(1, 'Campaign must contain between 1 and 10 milestones').max(10, 'Campaign must contain between 1 and 10 milestones'),
}).strict().superRefine((campaign, ctx) => {
  for (let index = 0; index < campaign.milestones.length; index++) {
    const milestone = campaign.milestones[index];
    const previous = campaign.milestones[index - 1];
    if (milestone.payout > campaign.totalBudget) ctx.addIssue({ code: 'custom', path: ['milestones', index, 'payout'], message: `Milestone ${index + 1} payout cannot exceed the campaign budget` });
    if (previous && milestone.views <= previous.views) ctx.addIssue({ code: 'custom', path: ['milestones', index, 'views'], message: 'Milestone view thresholds must be strictly increasing' });
    if (previous && milestone.payout <= previous.payout) ctx.addIssue({ code: 'custom', path: ['milestones', index, 'payout'], message: 'Milestone payouts must be strictly increasing' });
  }
});

const updateSchema = z.object({ name: nameSchema.optional(), description: descriptionSchema.optional() }).strict().refine(input => Object.keys(input).length > 0, 'Provide a name or description to update');
const actionSchema = z.enum(['pause', 'resume', 'complete', 'archive']);

export function validateCreateCampaign(body: unknown): CreateCampaignInput {
  const result = campaignSchema.safeParse(body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? 'Invalid campaign details', 400);
  return result.data;
}

export function validateUpdateCampaign(body: unknown): UpdateCampaignInput {
  const result = updateSchema.safeParse(body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? 'Invalid campaign update', 400);
  return result.data;
}

export function validateCampaignAction(body: unknown): CampaignAction {
  const result = z.object({ action: actionSchema }).strict().safeParse(body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? 'Invalid campaign action', 400);
  return result.data.action;
}
