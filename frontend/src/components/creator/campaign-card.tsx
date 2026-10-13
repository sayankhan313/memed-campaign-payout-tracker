import Link from 'next/link';
import { ArrowUpRight, Camera, CirclePlay, Eye, Sparkles } from 'lucide-react';
import type { CreatorCampaign } from '@/lib/creator';
import { formatINR, formatNumber } from '@/lib/creator';

export default function CreatorCampaignCard({ campaign }: { campaign: CreatorCampaign }) {
  const highestReward = Math.max(0, ...campaign.milestones.map(milestone => milestone.payout));
  const PlatformIcon = campaign.platform === 'instagram' ? Camera : CirclePlay;

  return (
    <Link href={`/creator/campaigns/${campaign.id}`} className="group flex h-full flex-col rounded-[22px] border border-[#EBE6E0] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#C1ACEA] hover:shadow-[0_12px_32px_rgba(48,32,77,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EAFD] text-[#8662CF]"><PlatformIcon size={23} /></div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8DF] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#4D7A30]"><span className="h-1.5 w-1.5 rounded-full bg-[#76AF44]" />Live</span>
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.15em] text-[#8F73C0]">{campaign.platform} campaign</p>
      <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight text-[#262033]">{campaign.name}</h3>
      <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-[#817A89]">{campaign.description || 'Create engaging content for this campaign and unlock milestone rewards.'}</p>
      <div className="mt-auto pt-6">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F6FA] p-4">
          <div><p className="text-[11px] text-[#928A9C]">Up to</p><p className="mt-1 text-lg font-black text-[#252133]">{formatINR(highestReward)}</p></div>
          <div><p className="flex items-center gap-1 text-[11px] text-[#928A9C]"><Eye size={12} />Milestones</p><p className="mt-1 text-lg font-black text-[#252133]">{formatNumber(campaign.milestones.length)}</p></div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#F0EDF2] pt-5 text-sm font-black text-[#7554B5]"><span className="flex items-center gap-2"><Sparkles size={16} />View campaign</span><ArrowUpRight size={18} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
      </div>
    </Link>
  );
}
