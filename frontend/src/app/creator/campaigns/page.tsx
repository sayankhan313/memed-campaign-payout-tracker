import { Compass, Sparkles } from 'lucide-react';
import CreatorCampaignCard from '@/components/creator/campaign-card';
import { getLiveCreatorCampaigns } from '@/lib/creator';

export const instant = false;

export default async function CreatorCampaignsPage() {
  const { data, error } = await getLiveCreatorCampaigns();
  const campaigns = data ?? [];

  return (
    <main className="mx-auto max-w-[1500px] space-y-7 px-5 py-8 sm:px-8 xl:px-10">
      <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.17em] text-[#8057D9]"><Sparkles size={15} />Campaign discovery</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Explore Campaigns</h1><p className="mt-3 text-sm leading-6 text-[#918A9A]">Discover active Instagram and YouTube campaigns, review milestones and submit your published post.</p></div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8E2EC] bg-white px-5 py-4"><span className="text-sm font-bold text-[#5D5669]">Live campaigns accepting submissions</span><span className="rounded-full bg-[#EAF7DF] px-3.5 py-1.5 text-xs font-black text-[#4F7B32]">{campaigns.length} available</span></div>
      {error ? <div role="alert" className="rounded-2xl border border-amber-200 bg-white p-7 text-sm text-amber-800">{error}</div> : campaigns.length === 0 ? (
        <div className="rounded-[22px] border border-[#EBE6E0] bg-white px-6 py-16 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2ECFE] text-[#8D6BDD]"><Compass size={30} /></div><h2 className="mt-5 text-xl font-black">No live campaigns available</h2><p className="mt-2 text-sm text-[#918A9A]">Paused, completed or budget-exhausted campaigns do not appear here.</p></div>
      ) : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{campaigns.map(campaign => <CreatorCampaignCard key={campaign.id} campaign={campaign} />)}</div>}
    </main>
  );
}
