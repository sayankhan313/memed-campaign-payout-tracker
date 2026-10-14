
import { cookies } from 'next/headers';
import Link from 'next/link';
import CampaignPerformanceChart from '@/components/brand/campaign-performance-chart';
import {
  ArrowUpRight, ChartNoAxesCombined, CircleDollarSign,
  Camera as Instagram, CirclePlay as Youtube, Wallet,
  AlertTriangle, ArrowRight, Eye, CalendarDays, ShieldAlert,
} from 'lucide-react';
import {
  getBrandCampaigns, formatINR, formatNumber,
  remainingBudget, budgetPercentage,
} from '@/lib/brand';

export const instant = false;

type SpikeAlert = {
  id: string;
  campaignId: string;
  campaignName: string;
  submissionId: string;
  creatorName: string;
  previousViews: number;
  newViews: number;
  deltaViews: number;
  source: 'SPIKE_DEMO' | 'SIMULATED_PLATFORM';
  reason: string;
  createdAt: string;
};

type SpikeAnalytics = {
  totalAlerts: number;
  affectedCampaigns: number;
  affectedSubmissions: number;
  recentAlerts: SpikeAlert[];
};

type SpikeAnalyticsResult = {
  analytics: SpikeAnalytics | null;
  error: string | null;
};

async function getBrandSpikeAnalytics(): Promise<SpikeAnalyticsResult> {
  const token = (await cookies()).get('memed_access_token')?.value;

  if (!token) {
    return { analytics: null, error: 'Authentication required.' };
  }

  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/+$/, '');

  try {
    const response = await fetch(`${backendUrl}/api/campaigns/brand/spike-analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      const error = response.status === 401
        ? 'Your session has expired.'
        : response.status === 403
          ? 'Spike analytics is only available to Brand accounts.'
          : 'Unable to load spike monitoring data.';

      return { analytics: null, error };
    }

    const result: { success?: boolean; data?: SpikeAnalytics } = await response.json();

    if (
      result.success !== true ||
      !result.data ||
      !Number.isSafeInteger(result.data.totalAlerts) ||
      !Number.isSafeInteger(result.data.affectedCampaigns) ||
      !Number.isSafeInteger(result.data.affectedSubmissions) ||
      !Array.isArray(result.data.recentAlerts)
    ) {
      return { analytics: null, error: 'Invalid spike analytics response.' };
    }

    return { analytics: result.data, error: null };
  } catch {
    return { analytics: null, error: 'Unable to connect to the spike monitoring service.' };
  }
}

function formatSpikeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return `${date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })} UTC`;
}

function SpikeAlertRow({ alert }: { alert: SpikeAlert }) {
  return (
    <article className="rounded-2xl border border-[#EEE9E6] bg-[#FFFEFB] p-5 transition hover:border-[#E9CCA0]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D8] text-[#A16C24]">
            <AlertTriangle size={19} />
          </div>

          <div className="min-w-0">
            <Link
              href={`/brand/campaigns/${encodeURIComponent(alert.campaignId)}`}
              className="inline-flex max-w-full items-center gap-1.5 text-sm font-black text-[#252133] hover:text-[#8057D9]"
            >
              <span className="truncate">{alert.campaignName}</span>
              <ArrowUpRight size={14} className="shrink-0" />
            </Link>
            <p className="mt-1 text-xs text-[#918A98]">
              Creator: <span className="font-bold text-[#62596A]">{alert.creatorName}</span>
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0D9] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#9D6728]">
          <AlertTriangle size={12} />
          Flagged
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#EEE9E6] bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#9D95A1]">Previous Views</p>
          <p className="mt-2 text-lg font-black tabular-nums text-[#252133]">
            {formatNumber(alert.previousViews)}
          </p>
        </div>

        <div className="rounded-xl border border-[#EEE9E6] bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#9D95A1]">Updated Views</p>
          <p className="mt-2 text-lg font-black tabular-nums text-[#252133]">
            {formatNumber(alert.newViews)}
          </p>
        </div>

        <div className="rounded-xl border border-[#EED4A8] bg-[#FFF6E8] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#A8793E]">Sudden Increase</p>
          <p className="mt-2 text-lg font-black tabular-nums text-[#98621D]">
            +{formatNumber(alert.deltaViews)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#968F9B]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} />
            {formatSpikeDate(alert.createdAt)}
          </span>
          <span className="rounded-lg bg-[#F5F0FC] px-2.5 py-1 font-bold text-[#7755B4]">
            {alert.source === 'SPIKE_DEMO' ? 'Spike Demo' : 'Simulated Update'}
          </span>
        </div>

        <Link
          href={`/brand/campaigns/${encodeURIComponent(alert.campaignId)}`}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#8057D9] hover:text-[#6443B0]"
        >
          Review Submission
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default async function BrandAnalyticsPage() {
  const [{ campaigns, error }, { analytics: spikeAnalytics, error: spikeError }] = await Promise.all([
    getBrandCampaigns(),
    getBrandSpikeAnalytics(),
  ]);

  if (error) {
    return (
      <main className="mx-auto max-w-[1400px] p-8">
        <h1 className="text-3xl font-black">Analytics</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </main>
    );
  }

  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.budgetSpent, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const utilisation = totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0;

  const platformStats = [
    {
      label: 'Instagram',
      icon: Instagram,
      campaigns: campaigns.filter(campaign => campaign.platform === 'instagram'),
      color: 'bg-[#A88BFA]',
    },
    {
      label: 'YouTube',
      icon: Youtube,
      campaigns: campaigns.filter(campaign => campaign.platform === 'youtube'),
      color: 'bg-[#C8F36B]',
    },
  ].map(platform => ({
    ...platform,
    budget: platform.campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0),
    spent: platform.campaigns.reduce((sum, campaign) => sum + campaign.budgetSpent, 0),
  }));

  const summaryStats = [
    { label: 'Campaigns', value: formatNumber(campaigns.length), icon: ChartNoAxesCombined, warning: false },
    { label: 'Total Allocation', value: formatINR(totalBudget), icon: Wallet, warning: false },
    { label: 'Creator Payouts', value: formatINR(totalSpent), icon: CircleDollarSign, warning: false },
    { label: 'Available Budget', value: formatINR(totalRemaining), icon: Wallet, warning: false },
    {
      label: 'Spike Alerts',
      value: spikeAnalytics ? formatNumber(spikeAnalytics.totalAlerts) : '—',
      icon: AlertTriangle,
      warning: true,
    },
  ];

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 xl:px-10">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">
          Performance Insights
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Campaign Analytics
        </h1>
        <p className="mt-3 text-sm text-[#8F8897]">
          Understand how budgets and creator payouts are distributed across your campaigns, and review unusual simulated view activity.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryStats.map(stat => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={`rounded-[20px] border p-6 ${
                stat.warning
                  ? 'border-[#EED9B6] bg-[#FFFBF3]'
                  : 'border-[#EBE7E2] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#8F8897]">{stat.label}</p>
                <Icon size={20} className={stat.warning ? 'text-[#B57A2C]' : 'text-[#9273D8]'} />
              </div>
              <p className={`mt-5 break-words text-2xl font-black tabular-nums ${
                stat.warning && spikeAnalytics && spikeAnalytics.totalAlerts > 0
                  ? 'text-[#98621D]'
                  : 'text-[#252133]'
              }`}>
                {stat.value}
              </p>
              {stat.warning && (
                <p className="mt-1 text-[11px] text-[#A58A67]">
                  {spikeAnalytics ? 'Simulated anomaly events' : 'Data unavailable'}
                </p>
              )}
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <CampaignPerformanceChart
          campaigns={campaigns}
          title="Campaign Budget Comparison"
          subtitle="Actual allocated and paid-out amounts by campaign"
          showAnalyticsLink={false}
        />

        <article className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
          <h2 className="text-lg font-black">Budget Utilisation</h2>
          <p className="mt-2 text-xs text-[#8F8897]">Across all Brand campaigns</p>

          <div className="mt-8 flex justify-center">
            <div
              className="flex h-[200px] w-[200px] items-center justify-center rounded-full"
              style={{
                background: totalBudget > 0
                  ? `conic-gradient(#A88BFA 0% ${utilisation}%, #EEE9F4 ${utilisation}% 100%)`
                  : '#EEE9F4',
              }}
            >
              <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full bg-white">
                <p className="text-4xl font-black">{utilisation}%</p>
                <p className="mt-2 text-xs text-[#948D9B]">Total spent</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t border-[#F0EDEB] pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-[#8F8897]">Paid out</span>
              <span className="font-black">{formatINR(totalSpent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8F8897]">Remaining</span>
              <span className="font-black">{formatINR(totalRemaining)}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={21} className="text-[#AA762E]" />
              <h2 className="text-lg font-black">View Spike Monitoring</h2>
            </div>
            <p className="mt-2 text-xs leading-6 text-[#8F8897]">
              Audit unusual increases in simulated Creator post views across your campaigns.
            </p>
          </div>

          {spikeAnalytics && spikeAnalytics.totalAlerts > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0D9] px-3.5 py-2 text-[11px] font-black text-[#9B6420]">
              <AlertTriangle size={13} />
              {formatNumber(spikeAnalytics.totalAlerts)} recorded alerts
            </span>
          )}
        </div>

        {spikeError ? (
          <div className="mt-6 rounded-xl border border-[#F0D4CE] bg-[#FFF7F5] px-5 py-4">
            <p role="alert" className="text-sm font-semibold text-[#A34837]">
              {spikeError}
            </p>
            <p className="mt-1 text-xs text-[#9D827C]">
              Other campaign analytics remain available.
            </p>
          </div>
        ) : spikeAnalytics && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#EEE9E6] bg-[#FCFBF9] p-5">
                <p className="text-xs font-semibold text-[#8F8897]">Total Spike Events</p>
                <p className="mt-3 text-2xl font-black tabular-nums text-[#252133]">
                  {formatNumber(spikeAnalytics.totalAlerts)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#EEE9E6] bg-[#FCFBF9] p-5">
                <p className="text-xs font-semibold text-[#8F8897]">Affected Campaigns</p>
                <p className="mt-3 text-2xl font-black tabular-nums text-[#252133]">
                  {formatNumber(spikeAnalytics.affectedCampaigns)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#EEE9E6] bg-[#FCFBF9] p-5">
                <p className="text-xs font-semibold text-[#8F8897]">Affected Submissions</p>
                <p className="mt-3 text-2xl font-black tabular-nums text-[#252133]">
                  {formatNumber(spikeAnalytics.affectedSubmissions)}
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#252133]">Recent View Anomalies</h3>
                <p className="mt-1 text-xs text-[#8F8897]">
                  Latest recorded simulation events
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#968F9D]">
                Latest 10
              </span>
            </div>

            {spikeAnalytics.recentAlerts.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#E7DFE9] bg-[#FCFBFE] px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EBFC] text-[#8D73C5]">
                  <Eye size={22} />
                </div>
                <h4 className="mt-4 text-sm font-black">No unusual view activity recorded</h4>
                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#918A98]">
                  Spike alerts will appear here when a Creator runs a qualifying view-spike simulation or an unusually large simulated platform update is recorded.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {spikeAnalytics.recentAlerts.map(alert => (
                  <SpikeAlertRow key={alert.id} alert={alert} />
                ))}
              </div>
            )}

            <p className="mt-5 flex items-start gap-2 border-t border-[#F0EDEB] pt-4 text-[11px] leading-5 text-[#9B93A0]">
              <ShieldAlert size={15} className="mt-0.5 shrink-0" />
              These are simulated view anomalies, not verified social-media fraud. Flagging does not automatically stop milestone payouts or override campaign budget protection.
            </p>
          </>
        )}
      </section>

      <section className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
        <h2 className="text-lg font-black">Platform Breakdown</h2>
        <p className="mt-2 text-xs text-[#8F8897]">Campaign activity across Instagram and YouTube</p>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {platformStats.map(platform => {
            const Icon = platform.icon;
            const share = campaigns.length > 0 ? Math.round(platform.campaigns.length / campaigns.length * 100) : 0;

            return (
              <article key={platform.label} className="rounded-2xl border border-[#EEE9E6] bg-[#FCFBF9] p-6">
                <div className="flex items-center gap-2">
                  <Icon size={20} className="text-[#8057D9]" />
                  <h3 className="font-black">{platform.label}</h3>
                </div>

                <p className="mt-5 text-3xl font-black">{platform.campaigns.length}</p>
                <p className="mt-1 text-xs text-[#8F8897]">Campaigns · {share}% of total</p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ECE7F0]">
                  <div className={`h-full rounded-full ${platform.color}`} style={{ width: `${share}%` }} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#EEE9E6] pt-5">
                  <div>
                    <p className="text-xs text-[#8F8897]">Allocated</p>
                    <p className="mt-2 text-lg font-black">{formatINR(platform.budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8F8897]">Paid out</p>
                    <p className="mt-2 text-lg font-black">{formatINR(platform.spent)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {campaigns.length > 0 && (
        <section className="rounded-[22px] border border-[#EBE7E2] bg-white p-7">
          <h2 className="text-lg font-black">Campaign Budget Efficiency</h2>
          <p className="mt-2 text-xs text-[#8F8897]">Budget consumption for each campaign</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {campaigns.map(campaign => (
              <Link
                key={campaign.id}
                href={`/brand/campaigns/${campaign.id}`}
                className="rounded-xl border border-[#EFEAE7] p-5 hover:border-[#C4B1E8]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-black">{campaign.name}</p>
                  <ArrowUpRight size={16} className="shrink-0 text-[#8F8897]" />
                </div>

                <div className="mt-4 flex justify-between text-xs">
                  <span className="text-[#8F8897]">{formatINR(remainingBudget(campaign))} left</span>
                  <span className="font-black">{budgetPercentage(campaign)}% spent</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0EAF4]">
                  <div
                    className="h-full rounded-full bg-[#A88BFA]"
                    style={{ width: `${budgetPercentage(campaign)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
