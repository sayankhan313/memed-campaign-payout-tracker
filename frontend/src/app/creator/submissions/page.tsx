import Link from 'next/link';
import { ArrowUpRight, Camera, ChartNoAxesColumn, CirclePlay, ExternalLink, Eye, FileCheck2 } from 'lucide-react';
import { formatDate, formatINR, formatNumber, getCreatorSubmissions, getLiveCreatorCampaigns } from '@/lib/creator';
import DemoViewSimulator from '@/components/creator/demo-view-simulator';

export const instant = false;

export default async function CreatorSubmissionsPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const [submissionsResult, campaignsResult, params] = await Promise.all([getCreatorSubmissions(), getLiveCreatorCampaigns(), searchParams]);
  const submissions = submissionsResult.data ?? [];
  const liveCampaigns = new Map((campaignsResult.data ?? []).map(campaign => [campaign.id, campaign]));
  const rewarded = submissions.filter(submission => submission.paidAmount > 0).length;
  const simulatorEnabled = process.env.ENABLE_DEMO_VIEW_SIMULATOR === 'true';

  return (
    <main className="mx-auto max-w-[1500px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <div><p className="text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]">Your content</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My Submissions</h1><p className="mt-3 text-sm text-[#918A9A]">Track submitted links, view counts and milestone payouts.</p></div>
      {params.submitted === '1' && <div role="status" className="rounded-xl border border-[#C9E7A2] bg-[#EFFADD] px-5 py-4 text-sm font-bold text-[#4C7D30]">Your post was submitted successfully. It now appears in your submission history.</div>}
      {submissionsResult.error ? <div role="alert" className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-800">{submissionsResult.error}</div> : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">{[{ label: 'Total submissions', value: formatNumber(submissions.length), icon: FileCheck2 }, { label: 'Rewarded submissions', value: formatNumber(rewarded), icon: ChartNoAxesColumn }, { label: 'Earned from posts', value: formatINR(submissions.reduce((total, submission) => total + submission.paidAmount, 0)), icon: Eye }].map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-[20px] border border-[#EBE6E0] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs text-[#918A9A]">{item.label}</p><Icon size={18} className="text-[#9475D1]" /></div><p className="mt-5 text-2xl font-black">{item.value}</p></div>; })}</section>
          <section className="overflow-hidden rounded-[22px] border border-[#EBE6E0] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 px-7 py-6"><div><h2 className="text-lg font-black">Submitted Posts</h2><p className="mt-1 text-xs text-[#928A99]">Up to 100 latest submissions</p></div><Link href="/creator/campaigns" className="flex items-center gap-2 rounded-xl bg-[#C8F36B] px-4 py-3 text-xs font-black text-[#191628]">New submission <ArrowUpRight size={16} /></Link></div>
            {submissions.length === 0 ? <div className="border-t border-[#F0EDF2] px-6 py-16 text-center"><FileCheck2 size={32} className="mx-auto text-[#AB91E0]" /><h3 className="mt-4 text-lg font-black">Nothing submitted yet</h3><p className="mt-2 text-sm text-[#918A9A]">Choose a live campaign and submit your published post.</p><Link href="/creator/campaigns" className="mt-5 inline-flex rounded-xl bg-[#191628] px-5 py-3 text-xs font-black text-white">Browse campaigns</Link></div>
              : <div className="divide-y divide-[#F0EDF2] border-t border-[#F0EDF2]">{submissions.map(submission => {
                const campaign = liveCampaigns.get(submission.campaignId);
                const platform = submission.postUrl.includes('instagram.com') ? 'Instagram' : 'YouTube';
                const safePost = (() => { try { const url = new URL(submission.postUrl); const host = url.hostname.toLowerCase(); return url.protocol === 'https:' && ['instagram.com', 'www.instagram.com', 'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host) ? url.toString() : null; } catch { return null; } })();
                const Icon = platform === 'Instagram' ? Camera : CirclePlay;
                return <div key={submission.id} className="grid gap-5 px-7 py-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(130px,0.6fr)_minmax(120px,0.6fr)] lg:items-center"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFD] text-[#8865CF]"><Icon size={20} /></div><div className="min-w-0"><p className="text-sm font-black">{campaign?.name ?? `Campaign ${submission.campaignId.slice(-8)}`}</p><p className="mt-1 text-xs text-[#918A9A]">{platform} · Submitted {formatDate(submission.createdAt)}</p>{safePost ? <a href={safePost} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1.5 text-xs font-bold text-[#7955C3]"><span className="truncate">Open submitted post</span><ExternalLink size={12} className="shrink-0" /></a> : <p className="mt-2 text-xs text-[#918A9A]">Post link unavailable</p>}</div></div><div><p className="text-xs text-[#918A9A]">Current Views</p><p className="mt-1 text-base font-black tabular-nums">{formatNumber(submission.views)}</p></div><div><p className="text-xs text-[#918A9A]">Earned Payout</p><p className="mt-1 text-base font-black tabular-nums text-[#5F8E37]">{formatINR(submission.paidAmount)}</p></div>{simulatorEnabled && <div className="lg:col-span-3"><DemoViewSimulator submissionId={submission.id} currentViews={submission.views} /></div>}</div>;
              })}</div>}
          </section>
        </>
      )}
    </main>
  );
}
