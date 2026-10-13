
import { AppError } from '../../errors/app.error.js';
import type { CampaignPlatform } from '../campaign/campaign.types.js';
import type { CreateSubmissionInput } from './submission.types.js';

export function detectPostPlatform(postUrl: string): CampaignPlatform {
  const url = new URL(postUrl);
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'instagram.com' || host === 'www.instagram.com') {
    if (['p', 'reel', 'tv'].includes(parts[0]) && parts.length >= 2) {
      return 'instagram';
    }
  }

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    if (parts[0] === 'watch' && url.searchParams.has('v') && url.searchParams.get('v')) {
      return 'youtube';
    }

    if (['shorts', 'live'].includes(parts[0]) && parts.length >= 2) {
      return 'youtube';
    }
  }

  if (['youtu.be', 'www.youtu.be'].includes(host) && parts.length >= 1) {
    return 'youtube';
  }

  throw new AppError('Provide a valid Instagram or YouTube post URL', 400);
}

export function validateCreateSubmission(body: unknown): CreateSubmissionInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Invalid submission details', 400);
  }

  const input = body as Record<string, unknown>;
  const campaignId = input.campaignId;
  const postUrl = typeof input.postUrl === 'string' ? input.postUrl.trim() : '';

  if (typeof campaignId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(campaignId)) {
    throw new AppError('Invalid campaign ID', 400);
  }

  if (!postUrl || postUrl.length > 2048) {
    throw new AppError('Post URL is required and must be under 2048 characters', 400);
  }

  let url: URL;

  try {
    url = new URL(postUrl);
  } catch {
    throw new AppError('Invalid post URL', 400);
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new AppError('Post URL must be a valid HTTPS link', 400);
  }

  detectPostPlatform(postUrl);
  url.hash = '';

  return { campaignId, postUrl: url.toString() };
}
