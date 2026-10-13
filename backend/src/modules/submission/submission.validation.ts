
import { z } from 'zod';
import { AppError } from '../../errors/app.error.js';
import type { CampaignPlatform } from '../campaign/campaign.types.js';
import type { CreateSubmissionInput } from './submission.types.js';

const createSubmissionSchema = z.object({
  campaignId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid campaign ID'),
  postUrl: z.string()
    .trim()
    .min(1, 'Post URL is required')
    .max(2048, 'Post URL must not exceed 2048 characters')
    .url('Invalid post URL')
    .refine(value => {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    }, 'Post URL must be a valid HTTPS link'),
});

export function detectPostPlatform(postUrl: string): CampaignPlatform {
  let url: URL;

  try {
    url = new URL(postUrl);
  } catch {
    throw new AppError('Invalid post URL', 400);
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);
  const firstSegment = parts[0];

  if (host === 'instagram.com' || host === 'www.instagram.com') {
    if (firstSegment && ['p', 'reel', 'tv'].includes(firstSegment) && parts.length >= 2) {
      return 'instagram';
    }
  }

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    if (firstSegment === 'watch' && url.searchParams.get('v')) {
      return 'youtube';
    }

    if (firstSegment && ['shorts', 'live'].includes(firstSegment) && parts.length >= 2) {
      return 'youtube';
    }
  }

  if (['youtu.be', 'www.youtu.be'].includes(host) && parts.length >= 1) {
    return 'youtube';
  }

  throw new AppError('Provide a valid Instagram or YouTube post URL', 400);
}

export function validateCreateSubmission(body: unknown): CreateSubmissionInput {
  const result = createSubmissionSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message ?? 'Invalid submission details',
      400
    );
  }

  detectPostPlatform(result.data.postUrl);

  const url = new URL(result.data.postUrl);
  url.hash = '';

  return {
    campaignId: result.data.campaignId,
    postUrl: url.toString(),
  };
}
