import { cookies } from 'next/headers';

export type CreatorPlatform = 'instagram' | 'youtube';
export type CreatorMilestone = { views: number; payout: number };

export type CreatorCampaign = {
  id: string;
  name: string;
  description: string;
  platform: CreatorPlatform;
  milestones: CreatorMilestone[];
  status: 'live' | 'paused' | 'completed' | 'archived';
  budgetExhausted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatorSubmission = {
  id: string;
  campaignId: string;
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatorEarnings = {
  totalEarnings: number;
  totalSubmissions: number;
};

export type Result<T> = { data: T | null; error: string | null };

export const formatINR = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);
export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

async function creatorRequest<T>(path: string): Promise<Result<T>> {
  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return { data: null, error: 'Please sign in to continue.' };

  try {
    const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
    const response = await fetch(`${backendUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const result: { success?: boolean; data?: T; message?: string } = await response.json().catch(() => ({}));

    if (!response.ok || !result.success || result.data === undefined) {
      return {
        data: null,
        error: response.status === 401 ? 'Your session has expired. Please sign in again.'
          : response.status === 403 ? 'This feature requires a Creator account.'
          : response.status === 404 ? 'Campaign not found or no longer accepting submissions.'
          : result.message ?? 'Unable to load data. Please try again.',
      };
    }

    return { data: result.data, error: null };
  } catch {
    return { data: null, error: 'Unable to connect to the server. Please try again.' };
  }
}

export function getLiveCreatorCampaigns() {
  return creatorRequest<CreatorCampaign[]>('/api/campaigns/live');
}

export function getCreatorCampaign(id: string) {
  return creatorRequest<CreatorCampaign>(`/api/campaigns/${encodeURIComponent(id)}`);
}

export function getCreatorSubmissions() {
  return creatorRequest<CreatorSubmission[]>('/api/submissions/mine');
}

export function getCreatorEarnings() {
  return creatorRequest<CreatorEarnings>('/api/earnings/me');
}
