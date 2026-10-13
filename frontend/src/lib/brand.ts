import { cookies } from 'next/headers';

export type Milestone = { views: number; payout: number };
export type CampaignStatus = 'live' | 'paused' | 'completed' | 'archived';
export type CampaignAction = 'pause' | 'resume' | 'complete' | 'archive';

export type BrandCampaign = {
  id: string;
  name: string;
  description: string;
  platform: 'instagram' | 'youtube';
  status: CampaignStatus;
  budgetExhausted: boolean;
  totalBudget: number;
  budgetSpent: number;
  budgetRemaining?: number;
  milestones: Milestone[];
  createdAt?: string;
  updatedAt?: string;
};

export type CampaignResult = { campaigns: BrandCampaign[]; error: string | null };

export const formatINR = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);
export const remainingBudget = (campaign: BrandCampaign) => Math.max(0, campaign.totalBudget - campaign.budgetSpent);
export const budgetPercentage = (campaign: BrandCampaign) => campaign.totalBudget > 0 ? Math.min(100, Math.round(campaign.budgetSpent / campaign.totalBudget * 100)) : 0;
export const isBudgetExhausted = (campaign: BrandCampaign) => campaign.budgetExhausted || remainingBudget(campaign) === 0;

async function authenticatedFetch(path: string): Promise<Response | null> {
  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return null;
  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
  return fetch(`${backendUrl}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
}

export async function getBrandCampaigns(): Promise<CampaignResult> {
  try {
    const response = await authenticatedFetch('/api/campaigns/mine');
    if (!response) return { campaigns: [], error: 'Please sign in to view your campaigns.' };
    if (!response.ok) return { campaigns: [], error: response.status === 401 ? 'Your session has expired. Please sign in again.' : response.status === 403 ? 'Only Brand accounts can access this workspace.' : 'Unable to load campaigns. Please try again.' };
    const result: { success: boolean; data?: BrandCampaign[] } = await response.json();
    if (!result.success || !Array.isArray(result.data)) return { campaigns: [], error: 'Unexpected campaign data received.' };
    return { campaigns: result.data.map(campaign => ({ ...campaign, description: campaign.description ?? '' })), error: null };
  } catch {
    return { campaigns: [], error: 'Backend unavailable. Please check your connection.' };
  }
}

export async function getBrandCampaignById(id: string): Promise<{ campaign: BrandCampaign | null; error: string | null }> {
  try {
    const response = await authenticatedFetch(`/api/campaigns/${encodeURIComponent(id)}`);
    if (!response) return { campaign: null, error: 'Authentication required.' };
    if (!response.ok) return { campaign: null, error: response.status === 404 ? 'Campaign not found or access denied.' : 'Unable to load campaign details.' };
    const result: { success: boolean; data?: BrandCampaign } = await response.json();
    if (!result.success || !result.data) return { campaign: null, error: 'Invalid campaign response.' };
    return { campaign: { ...result.data, description: result.data.description ?? '' }, error: null };
  } catch {
    return { campaign: null, error: 'Unable to connect to backend.' };
  }
}
