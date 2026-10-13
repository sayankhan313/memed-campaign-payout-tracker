import Link from 'next/link';
import { ArrowLeft, Camera, CirclePlay, Eye, FileText, LockKeyhole, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import SubmitPostForm from '@/components/creator/submit-post-form';
import { formatINR, formatNumber, getCreatorCampaign } from '@/lib/creator';

export const instant = false;

export default async function CreatorCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: campaign, error } = await getCreatorCampaign(id);

  if (!campaign) return (
    <main className="mx-auto max-w-[1200px] p-8"><div className="rounded-[22px] border border-[#EBE7E2] bg-white p-8"><h1 className="text-2xl font-black">Campaign unavailable</h1><p className="mt-3 text-sm text-[#918A98]">{error}</p><Link href="/creator/campaigns" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#8057D9]"><ArrowLeft size={16} />Explore live campaigns</Link></div></main>
  );

  const PlatformIcon = campaign.platform === 'instagram' ? Camera : CirclePlay;
  const highestReward = Math.max(0, ...campaign.milestones.map(milestone => milestone.payout));

  return (
    <main className="mx-auto max-w-[1380px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <Link href="/creator/campaigns" className="inline-flex items-center gap-2 text-xs font-black text-[#7859BC]"><ArrowLeft size={16} />Back to campaigns</Link>
      <section className="relative overflow-hidden rounded-[24px] bg-[#191628] p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-[#A88BFA]/15" />
        <div className="relative flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#C8F36B]"><PlatformIcon size={18} />{campaign.platform} campaign</p><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{campaign.name}</h1><p className="mt-4 max-w-2xl text-sm text-[#CDC4DB]">Review the campaign brief, publish your content and submit the post URL to participate.</p></div><span className="rounded-full bg-[#C8F36B] px-4 py-2 text-xs font-black uppercase text-[#191628]">Live · Open</span></div>
      </section>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[22px] border border-[#EBE6E0] bg-white p-7"><h2 className="flex items-center gap-3 text-lg font-black"><FileText size={20} className="text-[#9275D5]" />Campaign Brief</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-[#6D6477]">{campaign.description || 'Please follow the brand campaign guidelines and create original, engaging content.'}</p></section>
          <section className="overflow-hidden rounded-[22px] border border-[#EBE6E0] bg-white"><div className="border-b border-[#F0EDF2] p-7"><h2 className="flex items-center gap-3 text-lg font-black"><TrendingUp size={20} className="text-[#9275D5]" />Payout Milestones</h2><p className="mt-2 text-sm leading-6 text-[#908996]">Rewards use the highest milestone reached—not the sum of all tiers.</p></div><div className="divide-y divide-[#F0EDF2]">{[...campaign.milestones].sort((a, b) => a.views - b.views).map((milestone, index) => <div key={`${milestone.views}-${index}`} className="flex items-center justify-between gap-5 px-7 py-5"><div className="flex items-center gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1EBFE] text-sm font-black text-[#825DD1]">{index + 1}</span><div><p className="flex items-center gap-1.5 text-sm font-black"><Eye size={15} className="text-[#A58BCF]" />{formatNumber(milestone.views)} views</p><p className="mt-1 text-xs text-[#918A9A]">Milestone threshold</p></div></div><p className="text-lg font-black text-[#5A8839]">{formatINR(milestone.payout)}</p></div>)}</div></section>
          <section className="rounded-[20px] border border-[#E7DEEF] bg-[#F6F0FD] p-6"><h3 className="flex items-center gap-2 text-sm font-black text-[#6D528C]"><LockKeyhole size={17} />How earnings work</h3><p className="mt-3 text-xs leading-6 text-[#81728F]">Submitting a post does not immediately guarantee a payout. Earnings update when verified view counts cross a milestone and campaign budget is available. This prototype tracks view updates through the backend API.</p></section>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-[110px]"><section className="rounded-[22px] border border-[#EBE6E0] bg-white p-7"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#9275D5]">Reward potential</p><div className="mt-3 flex items-center gap-3"><div className="rounded-xl bg-[#EAF7DF] p-3 text-[#669744]"><Wallet size={22} /></div><div><p className="text-3xl font-black">{formatINR(highestReward)}</p><p className="mt-1 text-xs text-[#928A9A]">Highest available tier</p></div></div></section><section className="rounded-[22px] border border-[#EBE6E0] bg-white p-7"><h2 className="flex items-center gap-2 text-lg font-black"><Sparkles size={19} className="text-[#9677CF]" />Submit your post</h2><p className="mt-3 text-xs leading-6 text-[#918A9A]">Once your post is published, paste its public link below.</p><div className="mt-5"><SubmitPostForm campaignId={campaign.id} platform={campaign.platform} /></div></section></aside>
      </div>
    </main>
  );
}
