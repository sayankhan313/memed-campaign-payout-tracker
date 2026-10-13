
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, ChartNoAxesCombined, CircleDollarSign,
  Megaphone, Plus, Sparkles, Wallet,
  Camera as Instagram, CirclePlay as Youtube,
} from 'lucide-react';
import CampaignPerformanceChart from '@/components/brand/campaign-performance-chart';
import {
  getBrandCampaigns, formatINR, formatNumber,
  budgetPercentage, isBudgetExhausted, type BrandCampaign,
} from '@/lib/brand';

export const instant = false;

function CampaignRow({ campaign }: { campaign: BrandCampaign }) {
  const percentage = budgetPercentage(campaign);
  const remaining = Math.max(0, campaign.totalBudget - campaign.budgetSpent);
  const exhausted = remaining === 0;

  return (
    <Link
      href={`/brand/campaigns/${campaign.id}`}
      className="group grid gap-4 border-t border-[#F0EDEB] px-6 py-5 transition hover:bg-[#FCFBF8] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] md:items-center"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          campaign.platform === 'instagram'
            ? 'bg-[#FCE8F1] text-[#D04D91]'
            : 'bg-[#FDEBE8] text-[#DF5947]'
        }`}>
          {campaign.platform === 'instagram' ? <Instagram size={21} /> : <Youtube size={21} />}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#252133] group-hover:text-[#7652BA]">
            {campaign.name}
          </h3>
          {campaign.description && <p className="mt-1 truncate text-xs text-[#958E9A]">{campaign.description}</p>}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs capitalize text-[#958E9A]">{campaign.platform}</span>

            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
              campaign.status === 'live'
                ? 'bg-[#EAF7DC] text-[#46752D]'
                : campaign.status === 'paused' ? 'bg-[#FFF2DB] text-[#946721]' : 'bg-[#EEEAE5] text-[#817B80]'
            }`}>
              {campaign.status}
            </span>

            {exhausted && (
              <span className="rounded-full bg-[#FFF0DD] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#A76B25]">
                Budget Exhausted
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between gap-3 text-xs">
          <span className="text-[#8E8793]">Budget utilised</span>
          <span className="font-bold text-[#433950]">{percentage}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#F0EAF4]">
          <div
            className={`h-full rounded-full ${exhausted ? 'bg-[#D69D50]' : 'bg-[#A88BFA]'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="md:text-right">
        <p className="text-sm font-extrabold text-[#252133]">{formatINR(campaign.budgetSpent)}</p>
        <p className="mt-1 text-xs text-[#96909D]">of {formatINR(campaign.totalBudget)}</p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAE6E2] text-[#928A9B] transition group-hover:border-[#A88BFA] group-hover:text-[#7652BA]">
        <ArrowUpRight size={17} />
      </div>
    </Link>
  );
}

function BudgetUtilisationChart({ totalBudget, totalSpent }: { totalBudget: number; totalSpent: number }) {
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentage = totalBudget > 0
    ? Math.min(100, Math.max(0, totalSpent / totalBudget * 100))
    : 0;
  const displayedPercentage = Math.round(percentage);
  const circumference = 2 * Math.PI * 86;

  return (
    <article className="min-w-0 overflow-hidden rounded-[24px] border border-[#EAE5E0] bg-white p-6 shadow-[0_8px_35px_rgba(35,26,50,0.025)] sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#252133]">
            Overall Budget Utilisation
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#938B9C]">
            Combined spending across all your campaigns.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7DF] text-[#66933D]">
          <Wallet size={21} />
        </div>
      </div>

      <div className="relative mx-auto mt-7 flex h-[230px] w-[230px] items-center justify-center">
        <svg
          viewBox="0 0 240 240"
          className="h-full w-full"
          role="img"
          aria-label={`${displayedPercentage}% of the combined campaign budget has been used`}
        >
          <circle
            cx="120"
            cy="120"
            r="86"
            fill="none"
            stroke="#EEE9F4"
            strokeWidth="25"
          />

          {percentage > 0 && (
            <circle
              cx="120"
              cy="120"
              r="86"
              fill="none"
              stroke="#A88BFA"
              strokeWidth="25"
              strokeDasharray={`${circumference * percentage / 100} ${circumference}`}
              strokeLinecap={percentage === 100 ? 'butt' : 'round'}
              transform="rotate(-90 120 120)"
            />
          )}

          <circle cx="120" cy="120" r="63" fill="#FBFAFD" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[46px] font-black leading-none tracking-[-0.06em] text-[#252133] tabular-nums">
            {displayedPercentage}%
          </span>
          <span className="mt-3 text-xs font-semibold text-[#938B9C]">
            Budget used
          </span>
          <span className="mt-1 text-[11px] text-[#B3A9BE]">
            All campaigns
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#F7F4FC] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[#857A92]">
            Total Allocated
          </span>
          <span className="text-lg font-black text-[#252133] tabular-nums">
            {formatINR(totalBudget)}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E0F1]">
          <div
            className="h-full rounded-full bg-[#A88BFA]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#EFEAF3] p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#91899A]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#A88BFA]" />
            Paid Out
          </div>
          <p className="mt-3 break-words text-lg font-black text-[#252133]">
            {formatINR(totalSpent)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EFEAF3] p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#91899A]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E1DCEB]" />
            Remaining
          </div>
          <p className="mt-3 break-words text-lg font-black text-[#252133]">
            {formatINR(remaining)}
          </p>
        </div>
      </div>

      <Link
        href="/brand/analytics"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#E9E3F0] bg-[#FAF7FF] px-4 py-3 text-xs font-bold text-[#8057D9] transition hover:border-[#C3ADEC]"
      >
        Explore Budget Analytics <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}

export default async function BrandDashboardPage() {
  const { campaigns, error } = await getBrandCampaigns();

  if (error) {
    return (
      <main className="mx-auto max-w-[1500px] p-6 sm:p-10">
        <div className="rounded-2xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-black">Unable to load dashboard</h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
          <Link href="/brand/dashboard" className="mt-5 inline-block font-bold text-[#7652BA]">
            Try again →
          </Link>
        </div>
      </main>
    );
  }

  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.budgetSpent, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const liveCount = campaigns.filter(campaign => campaign.status === 'live' && !isBudgetExhausted(campaign)).length;
  const instagramCount = campaigns.filter(campaign => campaign.platform === 'instagram').length;
  const youtubeCount = campaigns.filter(campaign => campaign.platform === 'youtube').length;

  const stats = [
    {
      label: 'Total Campaigns',
      value: formatNumber(campaigns.length),
      sub: `${liveCount} accepting submissions`,
      icon: Megaphone,
      color: 'bg-[#F2ECFF] text-[#8057D9]',
    },
    {
      label: 'Budget Allocated',
      value: formatINR(totalBudget),
      sub: 'Across all campaigns',
      icon: Wallet,
      color: 'bg-[#EBF4FF] text-[#4D82D0]',
    },
    {
      label: 'Total Paid Out',
      value: formatINR(totalSpent),
      sub: 'Creator milestone rewards',
      icon: CircleDollarSign,
      color: 'bg-[#FFF1E6] text-[#D38A4E]',
    },
    {
      label: 'Budget Remaining',
      value: formatINR(remaining),
      sub: 'Available for payouts',
      icon: ChartNoAxesCombined,
      color: 'bg-[#EAF7DF] text-[#66933D]',
    },
  ];

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[26px] bg-[#191628] px-7 py-9 text-white sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-20 -top-28 h-[300px] w-[300px] rounded-full border-[54px] border-[#A88BFA]/20" />
        <div className="pointer-events-none absolute right-14 top-6 hidden h-52 w-52 rotate-12 rounded-[48px] border-[30px] border-[#C8F36B]/15 xl:block" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[27%] h-64 w-64 rounded-full bg-[#7855BC]/30 blur-[70px]" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#60536F] bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#C8F36B]">
            <Sparkles size={13} />
            Your Brand Studio
          </div>

          <h1 className="mt-5 text-3xl font-black leading-[1.1] tracking-tight sm:text-[43px]">
            Your campaigns.
            <br />
            <span className="text-[#C8F36B]">In motion.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#C6BFD2]">
            Launch creator campaigns, track your budgets and reward performance — all from one workspace.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/brand/campaigns/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C8F36B] px-5 py-3.5 text-sm font-black text-[#191628] transition hover:bg-[#B8E65A]"
            >
              <Plus size={18} />
              Create Campaign
              <ArrowUpRight size={17} />
            </Link>

            <span className="text-xs font-semibold text-[#C8BFDA]">
              {liveCount} {liveCount === 1 ? 'campaign' : 'campaigns'} accepting posts
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-[20px] border border-[#EBE7E2] bg-white p-6 shadow-[0_8px_28px_rgba(31,23,45,0.025)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#87808E]">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-5 break-words text-[26px] font-black tracking-[-0.04em] text-[#211C30]">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-[#98919E]">{stat.sub}</p>
            </article>
          );
        })}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)]">
        <CampaignPerformanceChart campaigns={campaigns} />
        <BudgetUtilisationChart totalBudget={totalBudget} totalSpent={totalSpent} />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)]">
        <article className="min-w-0 overflow-hidden rounded-[22px] border border-[#EBE7E2] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
            <div>
              <h2 className="text-lg font-black">Your Campaigns</h2>
              <p className="mt-1 text-xs text-[#958E9B]">
                Track the performance of your creator campaigns.
              </p>
            </div>

            <Link
              href="/brand/campaigns"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8057D9]"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="border-t border-[#F0EDEB] px-7 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2ECFF] text-[#8D6ADB]">
                <Megaphone size={25} />
              </div>

              <h3 className="mt-4 text-base font-black">
                Your next big campaign starts here.
              </h3>

              <p className="mt-2 text-sm text-[#958E9B]">
                Create a campaign to start tracking budgets and milestones.
              </p>

              <Link
                href="/brand/campaigns/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#191628] px-5 py-3 text-xs font-bold text-white"
              >
                <Plus size={15} />
                Create First Campaign
              </Link>
            </div>
          ) : (
            campaigns.slice(0, 5).map(campaign => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))
          )}
        </article>

        <div className="space-y-6">
          <article className="rounded-[22px] border border-[#EBE7E2] bg-white p-6">
            <h2 className="text-lg font-black">Quick Actions</h2>

            <div className="mt-5 space-y-2.5">
              {[
                { label: 'Create a Campaign', href: '/brand/campaigns/new' },
                { label: 'Explore Campaigns', href: '/brand/campaigns' },
                { label: 'View Analytics', href: '/brand/analytics' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-[#EFEAE7] px-4 py-3.5 text-sm font-semibold transition hover:border-[#C1AFE9] hover:bg-[#FBF9FF]"
                >
                  {action.label}
                  <ArrowUpRight size={16} className="text-[#9889AC]" />
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[22px] border border-[#EBE7E2] bg-white p-6">
            <h2 className="text-lg font-black">Platform Breakdown</h2>
            <p className="mt-1.5 text-xs text-[#958E9B]">
              Campaign distribution by platform.
            </p>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: 'Instagram',
                  count: instagramCount,
                  icon: Instagram,
                  color: 'bg-[#A88BFA]',
                },
                {
                  label: 'YouTube',
                  count: youtubeCount,
                  icon: Youtube,
                  color: 'bg-[#C8F36B]',
                },
              ].map(platform => {
                const Icon = platform.icon;
                const percentage = campaigns.length > 0
                  ? Math.round(platform.count / campaigns.length * 100)
                  : 0;

                return (
                  <div key={platform.label}>
                    <div className="mb-2.5 flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <Icon size={16} />
                        {platform.label}
                      </span>

                      <span>
                        {platform.count} · {percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#F0EDF2]">
                      <div
                        className={`h-full rounded-full ${platform.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
