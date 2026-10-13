import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChartNoAxesColumn, CircleDollarSign, Compass, FileCheck2, Sparkles, Wallet } from 'lucide-react';
import CreatorCampaignCard from '@/components/creator/campaign-card';
import { formatINR, formatNumber, getCreatorEarnings, getCreatorSubmissions, getLiveCreatorCampaigns } from '@/lib/creator';

export const instant = false;

export default async function CreatorDashboardPage() {
  const [campaignResult, submissionResult, earningsResult] = await Promise.all([getLiveCreatorCampaigns(), getCreatorSubmissions(), getCreatorEarnings()]);
  const campaigns = campaignResult.data ?? [];
  const submissions = submissionResult.data ?? [];
  const earnings = earningsResult.data;
  const totalPaid = earnings?.totalEarnings ?? 0;
  const activeSubmissions = submissions.filter(submission => submission.paidAmount > 0).length;

  return (
    <main className="mx-auto max-w-[1500px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[26px] bg-[#191628] px-7 py-9 text-white sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border-[44px] border-[#A88BFA]/15" />
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C8F36B]"><Sparkles size={16} />Creator dashboard</p>
        <h1 className="relative mt-4 text-3xl font-black tracking-tight sm:text-4xl">Create content. Earn rewards.</h1>
        <p className="relative mt-4 max-w-2xl text-sm leading-7 text-[#C8C0D4]">Discover live campaigns, share your Instagram or YouTube post and track milestone-based earnings in one place.</p>
        <Link href="/creator/campaigns" className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-[#C8F36B] px-5 py-3.5 text-sm font-black text-[#191628] hover:bg-[#B8E65A]">Explore live campaigns <ArrowRight size={17} /></Link>
      </section>

      {(campaignResult.error || submissionResult.error || earningsResult.error) && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Some data could not be loaded. {campaignResult.error || submissionResult.error || earningsResult.error}</div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Earnings', value: formatINR(totalPaid), icon: Wallet, sub: 'Calculated milestone rewards' },
          { label: 'My Submissions', value: formatNumber(earnings?.totalSubmissions ?? submissions.length), icon: FileCheck2, sub: 'Posts submitted' },
          { label: 'Rewarded Posts', value: formatNumber(activeSubmissions), icon: CircleDollarSign, sub: 'Posts with earned rewards' },
          { label: 'Live Campaigns', value: formatNumber(campaigns.length), icon: Compass, sub: 'Currently accepting posts' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[20px] border border-[#EBE6E0] bg-white p-6">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-[#918A9A]">{stat.label}</p><Icon size={18} className="text-[#9475D1]" /></div>
              <p className="mt-5 text-2xl font-black tabular-nums text-[#252133]">{stat.value}</p>
              <p className="mt-2 text-xs text-[#A099A6]">{stat.sub}</p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">Discover</p><h2 className="mt-2 text-2xl font-black">Live campaigns</h2><p className="mt-2 text-sm text-[#918A9A]">Choose a campaign that matches your content.</p></div><Link href="/creator/campaigns" className="flex shrink-0 items-center gap-1 text-sm font-black text-[#7955C3]">View all <ArrowUpRight size={17} /></Link></div>
        {campaignResult.error ? <div className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-800">{campaignResult.error}</div>
          : campaigns.length === 0 ? <div className="rounded-[20px] border border-[#EBE6E0] bg-white p-9 text-center"><Compass className="mx-auto text-[#B39CE1]" size={30} /><p className="mt-3 text-lg font-black">No live campaigns right now</p><p className="mt-2 text-sm text-[#908996]">Come back when Brands launch new campaigns.</p></div>
          : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{campaigns.slice(0, 3).map(campaign => <CreatorCampaignCard key={campaign.id} campaign={campaign} />)}</div>}
      </section>

      <section className="rounded-[22px] border border-[#EBE6E0] bg-white p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#F1EBFD] p-3 text-[#8057D9]"><ChartNoAxesColumn size={19} /></div><div><h2 className="text-lg font-black">Recent submissions</h2><p className="mt-1 text-xs text-[#918A9A]">Your submitted posts and earned rewards</p></div></div><Link href="/creator/submissions" className="text-xs font-black text-[#8057D9]">View all →</Link></div>
        {!submissionResult.error && submissions.length === 0 ? <div className="mt-6 border-t border-[#F0EDF2] pt-8 text-center text-sm text-[#918A9A]">No posts submitted yet. Explore campaigns to get started.</div>
          : <div className="mt-6 divide-y divide-[#F0EDF2] border-t border-[#F0EDF2]">{submissions.slice(0, 4).map(submission => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="max-w-md truncate text-sm font-bold text-[#302A3B]">{submission.postUrl}</p><p className="mt-1 text-xs text-[#908996]">{formatNumber(submission.views)} views</p></div><span className="text-sm font-black text-[#648B37]">{formatINR(submission.paidAmount)}</span></div>)}</div>}
      </section>
    </main>
  );
}
