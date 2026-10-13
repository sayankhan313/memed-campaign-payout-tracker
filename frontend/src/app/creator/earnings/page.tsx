import Link from 'next/link';
import { ArrowUpRight, CircleDollarSign, FileCheck2, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { formatINR, formatNumber, getCreatorEarnings, getCreatorSubmissions } from '@/lib/creator';

export const instant = false;

export default async function CreatorEarningsPage() {
  const [earningsResult, submissionsResult] = await Promise.all([getCreatorEarnings(), getCreatorSubmissions()]);
  const earnings = earningsResult.data;
  const submissions = submissionsResult.data ?? [];
  const rewarded = submissions.filter(submission => submission.paidAmount > 0);

  return (
    <main className="mx-auto max-w-[1500px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <div><p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">Milestone payouts</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My Earnings</h1><p className="mt-3 text-sm text-[#918A9A]">An accurate overview of your tracked campaign milestone rewards.</p></div>
      <section className="relative overflow-hidden rounded-[24px] bg-[#191628] p-8 text-white sm:p-10"><div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-[#A88BFA]/15" /><p className="flex items-center gap-2 text-sm font-semibold text-[#C5BED1]"><Wallet size={19} className="text-[#C8F36B]" />Total earned from milestones</p><p className="relative mt-4 text-4xl font-black tabular-nums sm:text-5xl">{formatINR(earnings?.totalEarnings ?? 0)}</p><p className="relative mt-5 max-w-lg text-xs leading-6 text-[#C4BBD2]">This total reflects milestone rewards recorded by the backend. It does not represent a bank transfer or external payment settlement.</p></section>
      {(earningsResult.error || submissionsResult.error) && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{earningsResult.error || submissionsResult.error}</div>}
      <section className="grid gap-4 sm:grid-cols-3">{[{ label: 'Total Earnings', value: formatINR(earnings?.totalEarnings ?? 0), icon: CircleDollarSign }, { label: 'Total Submissions', value: formatNumber(earnings?.totalSubmissions ?? submissions.length), icon: FileCheck2 }, { label: 'Posts With Rewards', value: formatNumber(rewarded.length), icon: TrendingUp }].map(stat => { const Icon = stat.icon; return <div key={stat.label} className="rounded-[20px] border border-[#EBE6E0] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs text-[#918A9A]">{stat.label}</p><Icon size={18} className="text-[#9B7ACF]" /></div><p className="mt-5 text-2xl font-black">{stat.value}</p></div>; })}</section>
      <section className="overflow-hidden rounded-[22px] border border-[#EBE6E0] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EDF2] px-7 py-6"><div><h2 className="text-lg font-black">Reward breakdown</h2><p className="mt-1 text-xs text-[#918A9A]">Earnings by submitted post</p></div><Link href="/creator/submissions" className="inline-flex items-center gap-1 text-xs font-black text-[#7955C3]">View submissions <ArrowUpRight size={16} /></Link></div>
        {rewarded.length === 0 ? <div className="px-7 py-14 text-center"><CircleDollarSign size={30} className="mx-auto text-[#AD94E1]" /><h3 className="mt-3 text-lg font-black">No milestone rewards yet</h3><p className="mt-2 text-sm text-[#918A9A]">Once your posts reach eligible view milestones, recorded earnings will appear here.</p></div> : <div className="divide-y divide-[#F0EDF2]">{rewarded.map(submission => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-4 px-7 py-5"><div className="min-w-0"><p className="max-w-lg truncate text-sm font-bold text-[#30293B]">{submission.postUrl}</p><p className="mt-1 text-xs text-[#928A9A]">{formatNumber(submission.views)} views</p></div><p className="text-lg font-black text-[#5D8C39]">{formatINR(submission.paidAmount)}</p></div>)}</div>}
      </section>
      <section className="flex items-start gap-3 rounded-xl border border-[#E2D8EC] bg-[#F5EFFB] px-6 py-5"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#8265BC]" /><div><p className="text-sm font-black text-[#695180]">Milestone payout rule</p><p className="mt-2 text-xs leading-6 text-[#80718F]">When the same post crosses a higher view milestone, the backend awards only the difference from the amount already earned. Campaign budgets are never exceeded.</p></div></section>
    </main>
  );
}
