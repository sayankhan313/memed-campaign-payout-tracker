export const instant = false;


import Link from 'next/link';
import { ArrowUpRight, Camera as Instagram, CirclePlay as Youtube, Megaphone, Plus } from 'lucide-react';
import {
  getBrandCampaigns, formatINR, budgetPercentage, remainingBudget, isBudgetExhausted,
} from '@/lib/brand';

export default async function BrandCampaignsPage() {
  const { campaigns, error } = await getBrandCampaigns();

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 xl:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">Campaign Management</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My Campaigns</h1>
          <p className="mt-3 text-sm text-[#8F8897]">Manage and monitor every campaign from one place.</p>
        </div>

        <Link href="/brand/campaigns/new" className="inline-flex items-center gap-2 rounded-xl bg-[#C8F36B] px-5 py-3.5 text-sm font-black text-[#191628] hover:bg-[#B8E65A]">
          <Plus size={18} /> New Campaign
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-7 text-sm text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Campaigns', value: campaigns.length },
              { label: 'Accepting Submissions', value: campaigns.filter(campaign => campaign.status === 'live' && !isBudgetExhausted(campaign)).length },
              { label: 'Paused Campaigns', value: campaigns.filter(campaign => campaign.status === 'paused').length },
              { label: 'Completed / Archived', value: campaigns.filter(campaign => ['completed', 'archived'].includes(campaign.status)).length },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-[#EBE7E2] bg-white p-6">
                <p className="text-xs font-semibold text-[#8F8897]">{item.label}</p>
                <p className="mt-3 text-3xl font-black">{item.value}</p>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-[22px] border border-[#EBE7E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#F0EDEB] px-6 py-6">
              <div>
                <h2 className="text-lg font-black">All Campaigns</h2>
                <p className="mt-1 text-xs text-[#928B98]">{campaigns.length} campaigns found</p>
              </div>
              <Megaphone size={21} className="text-[#A88BFA]" />
            </div>

            {campaigns.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <h3 className="text-lg font-black">No campaigns yet</h3>
                <p className="mt-2 text-sm text-[#928B98]">Start by creating your first creator campaign.</p>
                <Link href="/brand/campaigns/new" className="mt-5 inline-flex rounded-xl bg-[#191628] px-5 py-3 text-sm font-bold text-white">
                  Create Campaign
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EDEB]">
                {campaigns.map(campaign => (
                  <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`} className="block p-6 transition hover:bg-[#FCFAFE]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFE] text-[#8057D9]">
                          {campaign.platform === 'instagram' ? <Instagram size={22} /> : <Youtube size={22} />}
                        </div>
                        <div>
                          <h3 className="font-black">{campaign.name}</h3>
                          {campaign.description && <p className="mt-1 line-clamp-2 max-w-xl text-xs text-[#928B98]">{campaign.description}</p>}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs capitalize text-[#928B98]">{campaign.platform}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              campaign.status === 'live' ? 'bg-[#EAF7DC] text-[#46752D]' : campaign.status === 'paused' ? 'bg-[#FFF2DB] text-[#946721]' : 'bg-[#EEEAE5] text-[#817B80]'
                            }`}>
                              {campaign.status}
                            </span>
                            {isBudgetExhausted(campaign) && <span className="rounded-full bg-[#FFF2DB] px-2.5 py-1 text-[10px] font-black uppercase text-[#946721]">Budget Exhausted</span>}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={19} className="text-[#817A8E]" />
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-[#918A98]">Total Budget</p>
                        <p className="mt-1 font-black">{formatINR(campaign.totalBudget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#918A98]">Paid Out</p>
                        <p className="mt-1 font-black">{formatINR(campaign.budgetSpent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#918A98]">Remaining</p>
                        <p className="mt-1 font-black">{formatINR(remainingBudget(campaign))}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-between text-xs text-[#827B8B]">
                      <span>{campaign.milestones?.length ?? 0} payout milestones</span>
                      <span>{budgetPercentage(campaign)}% utilised</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EFEAF4]">
                      <div className="h-full rounded-full bg-[#A88BFA]" style={{ width: `${budgetPercentage(campaign)}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
