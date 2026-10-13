
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  Camera as Instagram, CirclePlay as Youtube, Wallet, ChartNoAxesColumn,
  FileText, LockKeyhole, Users, ExternalLink, Eye, CalendarDays,
  CircleDollarSign,
} from 'lucide-react';
import CampaignControls from '@/components/brand/campaign-controls';
import {
  getBrandCampaignById, formatINR, formatNumber,
  remainingBudget, budgetPercentage, isBudgetExhausted,
} from '@/lib/brand';

export const instant = false;

type BrandCampaignSubmission = {
  id: string;
  campaignId: string;
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    instagramUsername?: string;
    youtubeChannelUrl?: string;
  };
};

type SubmissionsResult = {
  submissions: BrandCampaignSubmission[];
  error: string | null;
};

async function getCampaignSubmissions(campaignId: string): Promise<SubmissionsResult> {
  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return { submissions: [], error: 'Authentication required' };

  try {
    const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
    const response = await fetch(`${backendUrl}/api/campaigns/${encodeURIComponent(campaignId)}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = response.status === 401
        ? 'Your session has expired.'
        : response.status === 403 || response.status === 404
          ? 'You cannot access these campaign submissions.'
          : 'Unable to load Creator submissions.';

      return { submissions: [], error: message };
    }

    const result: { success: boolean; data?: BrandCampaignSubmission[] } = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return { submissions: [], error: 'Invalid submission response.' };
    }

    return { submissions: result.data, error: null };
  } catch {
    return { submissions: [], error: 'Unable to connect to the submission service.' };
  }
}

function getSafeSocialUrl(value: string | undefined, platform: 'instagram' | 'youtube'): string | null {
  if (!value) return null;

  if (platform === 'instagram') {
    const username = value.replace(/^@/, '');
    return /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/.test(username)
      ? `https://www.instagram.com/${username}/`
      : null;
  }

  try {
    const url = new URL(value);
    const allowedHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];
    return url.protocol === 'https:' && allowedHosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function getSafePostUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const validHost = ['instagram.com', 'youtube.com', 'youtu.be'].some(domain => host === domain || host.endsWith(`.${domain}`));
    return url.protocol === 'https:' && validHost ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CreatorSubmissionRow({ submission }: { submission: BrandCampaignSubmission }) {
  const instagramUrl = getSafeSocialUrl(submission.creator.instagramUsername, 'instagram');
  const youtubeUrl = getSafeSocialUrl(submission.creator.youtubeChannelUrl, 'youtube');
  const postUrl = getSafePostUrl(submission.postUrl);
  const creatorName = submission.creator.name || 'Unknown Creator';

  return (
    <div className="grid gap-5 border-t border-[#F0EDEB] px-6 py-6 transition hover:bg-[#FDFBFF] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(100px,0.65fr)_minmax(110px,0.7fr)] lg:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EBFE] text-lg font-black text-[#8057D9]">
          {creatorName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#252133]">{creatorName}</p>
          <p className="mt-1 text-[11px] text-[#968F9D]">Creator · Profile unverified</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-[#FCEAF4] px-2.5 py-1.5 text-[11px] font-bold text-[#B24586] hover:bg-[#F8D9EB]"
              >
                <Instagram size={13} />
                @{submission.creator.instagramUsername?.replace(/^@/, '')}
                <ExternalLink size={11} />
              </a>
            )}

            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-[#FDEBEA] px-2.5 py-1.5 text-[11px] font-bold text-[#C34C42] hover:bg-[#FADBD9]"
              >
                <Youtube size={13} />
                YouTube
                <ExternalLink size={11} />
              </a>
            )}

            {!instagramUrl && !youtubeUrl && (
              <span className="text-[11px] text-[#A39BA8]">No social profiles provided</span>
            )}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#A39BA8]">
            <CalendarDays size={12} />
            Submitted {formatDate(submission.createdAt)}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold text-[#958D9B] lg:hidden">Submitted Post</p>

        {postUrl ? (
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={submission.postUrl}
            className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#EAE3F3] bg-[#FBF9FE] px-3.5 py-2.5 text-xs font-bold text-[#7955C3] transition hover:border-[#BDA7EA]"
          >
            <span className="truncate">View Submitted Post</span>
            <ExternalLink size={14} className="shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-[#958D9B]">Post link unavailable</span>
        )}

        <p className="mt-2 max-w-full truncate text-[11px] text-[#A49CAB]" title={submission.postUrl}>
          {submission.postUrl}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold text-[#958D9B] lg:hidden">Post Views</p>
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#9275D7]" />
          <span className="text-sm font-black tabular-nums">{formatNumber(submission.views)}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#A49CAB]">Current views</p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold text-[#958D9B] lg:hidden">Creator Earnings</p>
        <div className="flex items-center gap-2">
          <CircleDollarSign size={16} className="text-[#66933D]" />
          <span className="text-sm font-black tabular-nums">{formatINR(submission.paidAmount)}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#A49CAB]">Milestone earnings</p>
      </div>
    </div>
  );
}

export default async function BrandCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { campaign, error } = await getBrandCampaignById(id);

  if (!campaign) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
        <div className="rounded-2xl border border-[#EBE7E2] bg-white p-8">
          <h1 className="text-2xl font-black">Campaign unavailable</h1>
          <p className="mt-3 text-sm text-[#8C8593]">{error}</p>
          <Link href="/brand/campaigns" className="mt-5 inline-block text-sm font-bold text-[#8057D9]">
            View All Campaigns →
          </Link>
        </div>
      </main>
    );
  }

  const { submissions, error: submissionsError } = await getCampaignSubmissions(id);
  const PlatformIcon = campaign.platform === 'instagram' ? Instagram : Youtube;
  const exhausted = isBudgetExhausted(campaign);
  const totalSubmissionEarnings = submissions.reduce((sum, submission) => sum + submission.paidAmount, 0);

  return (
    <main className="mx-auto max-w-[1350px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[24px] bg-[#191628] p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-[#A88BFA]/15" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#C8F36B]">
              <PlatformIcon size={17} />
              {campaign.platform}
            </div>

            <h1 className="mt-4 break-words text-3xl font-black sm:text-4xl">{campaign.name}</h1>
            <p className="mt-3 text-sm text-[#C5BDD1]">
              Manage your campaign, creator submissions and milestone rewards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
              campaign.status === 'live' ? 'bg-[#C8F36B] text-[#191628]' : 'bg-[#473C57] text-white'
            }`}>
              {campaign.status}
            </span>

            {exhausted && (
              <span className="rounded-full bg-[#FFEFDB] px-4 py-2 text-xs font-black uppercase text-[#915B26]">
                Budget Exhausted
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#8F6DDD]" />
              <h2 className="text-lg font-black">Campaign Description</h2>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#6F677A]">
              {campaign.description || 'No description has been added to this campaign yet. Use Edit Details to add a brief.'}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Allocated Budget', value: formatINR(campaign.totalBudget), icon: Wallet },
              { label: 'Total Paid Out', value: formatINR(campaign.budgetSpent), icon: ChartNoAxesColumn },
              { label: 'Budget Remaining', value: formatINR(remainingBudget(campaign)), icon: Wallet },
            ].map(stat => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-[20px] border border-[#EBE7E2] bg-white p-5">
                  <Icon size={20} className="text-[#8F6DDD]" />
                  <p className="mt-5 text-xs font-semibold text-[#918A98]">{stat.label}</p>
                  <p className="mt-2 break-words text-xl font-black">{stat.value}</p>
                </div>
              );
            })}
          </section>

          <section className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
            <div className="flex justify-between text-sm">
              <h2 className="font-black">Budget Utilisation</h2>
              <span className="font-black text-[#8057D9]">{budgetPercentage(campaign)}%</span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#F0EAF4]">
              <div className="h-full rounded-full bg-[#A88BFA]" style={{ width: `${budgetPercentage(campaign)}%` }} />
            </div>

            <p className="mt-3 text-xs text-[#918A98]">
              {formatINR(campaign.budgetSpent)} paid out of {formatINR(campaign.totalBudget)} allocated.
            </p>
          </section>

          <section className="overflow-hidden rounded-[22px] border border-[#EBE7E2] bg-white">
            <div className="border-b border-[#F0EDEB] p-7">
              <h2 className="text-lg font-black">Payout Milestones</h2>
              <p className="mt-2 text-sm text-[#918A98]">
                Creators earn the highest milestone crossed; upgrades pay only the difference.
              </p>
            </div>

            <div className="divide-y divide-[#F0EDEB]">
              {[...(campaign.milestones ?? [])].sort((a, b) => a.views - b.views).map((milestone, index, all) => (
                <div key={`${milestone.views}-${index}`} className="flex flex-wrap items-center justify-between gap-4 px-7 py-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EBFC] text-sm font-black text-[#8057D9]">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-sm font-black">{formatNumber(milestone.views)} views</p>
                      <p className="mt-1 text-xs text-[#918A98]">Required view threshold</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black">{formatINR(milestone.payout)}</p>
                    <p className="mt-1 text-xs text-[#918A98]">
                      {index === 0
                        ? 'First reward'
                        : `+${formatINR(Math.max(0, milestone.payout - all[index - 1].payout))} incremental`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[112px]">
          <CampaignControls campaign={campaign} />

          <section className="rounded-[20px] border border-[#E7DEEF] bg-[#F6F0FD] p-5">
            <div className="flex items-center gap-2 text-sm font-black text-[#6D528C]">
              <LockKeyhole size={18} />
              Reward Protection
            </div>

            <p className="mt-3 text-xs leading-6 text-[#81728F]">
              Budget, platform and payout thresholds cannot be changed after launch. Paused and Completed campaigns can still settle existing submissions. Archiving permanently stops future view updates and payouts, so settle obligations first.
            </p>
          </section>
        </aside>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#EAE5E0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-7 sm:px-7">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EBFE] text-[#8057D9]">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black">Creator Submissions</h2>
                <p className="mt-1 text-xs text-[#928A98]">
                  Review participating Creators, their social profiles and earned rewards.
                </p>
              </div>
            </div>
          </div>

          {!submissionsError && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F1ECFE] px-3.5 py-2 text-xs font-black text-[#8057D9]">
                {submissions.length} {submissions.length === 1 ? 'Submission' : 'Submissions'}
              </span>
              <span className="rounded-full bg-[#EAF7DF] px-3.5 py-2 text-xs font-black text-[#527B35]">
                {formatINR(totalSubmissionEarnings)} earned
              </span>
            </div>
          )}
        </div>

        {submissionsError ? (
          <div className="border-t border-[#F0EDEB] px-7 py-10">
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {submissionsError}
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="border-t border-[#F0EDEB] px-7 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2ECFF] text-[#8D6ADB]">
              <Users size={28} />
            </div>
            <h3 className="mt-5 text-lg font-black">No Creator submissions yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#958E9B]">
              When a Creator submits an Instagram or YouTube post for this campaign, their submission will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(100px,0.65fr)_minmax(110px,0.7fr)] gap-5 border-t border-[#F0EDEB] bg-[#FCFBFD] px-6 py-4 text-[11px] font-extrabold uppercase tracking-wide text-[#928A98] lg:grid">
              <span>Creator & Profiles</span>
              <span>Submitted Post</span>
              <span>Views</span>
              <span>Earnings</span>
            </div>

            {submissions.map(submission => (
              <CreatorSubmissionRow key={submission.id} submission={submission} />
            ))}

            <div className="border-t border-[#F0EDEB] bg-[#FCFBFD] px-7 py-4">
              <p className="text-[11px] text-[#968E9D]">
                Showing the latest {submissions.length} submissions. Social profiles are self-declared and not independently verified.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
