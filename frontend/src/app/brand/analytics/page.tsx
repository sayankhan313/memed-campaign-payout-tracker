export const instant = false;


import Link from 'next/link';
import CampaignPerformanceChart from '@/components/brand/campaign-performance-chart';
import {
  ArrowUpRight, ChartNoAxesCombined, CircleDollarSign,
 Camera as Instagram, CirclePlay as Youtube, Wallet,
} from 'lucide-react';
import {
  getBrandCampaigns, formatINR, formatNumber,
  remainingBudget, budgetPercentage,
} from '@/lib/brand';

export default async function BrandAnalyticsPage() {
  const { campaigns, error } = await getBrandCampaigns();

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

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 xl:px-10">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">Performance Insights</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Campaign Analytics</h1>
        <p className="mt-3 text-sm text-[#8F8897]">
          Understand how budgets and creator payouts are distributed across your campaigns.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Campaigns', value: formatNumber(campaigns.length), icon: ChartNoAxesCombined },
          { label: 'Total Allocation', value: formatINR(totalBudget), icon: Wallet },
          { label: 'Creator Payouts', value: formatINR(totalSpent), icon: CircleDollarSign },
          { label: 'Available Budget', value: formatINR(totalRemaining), icon: Wallet },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[20px] border border-[#EBE7E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#8F8897]">{stat.label}</p>
                <Icon size={20} className="text-[#9273D8]" />
              </div>
              <p className="mt-5 break-words text-2xl font-black">{stat.value}</p>
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
              <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`} className="rounded-xl border border-[#EFEAE7] p-5 hover:border-[#C4B1E8]">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-black">{campaign.name}</p>
                  <ArrowUpRight size={16} className="shrink-0 text-[#8F8897]" />
                </div>
                <div className="mt-4 flex justify-between text-xs">
                  <span className="text-[#8F8897]">{formatINR(remainingBudget(campaign))} left</span>
                  <span className="font-black">{budgetPercentage(campaign)}% spent</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0EAF4]">
                  <div className="h-full rounded-full bg-[#A88BFA]" style={{ width: `${budgetPercentage(campaign)}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
