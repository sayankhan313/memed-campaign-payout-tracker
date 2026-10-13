'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, CircleCheck, CircleHelp, Plus, Sparkles, Trash2, Wallet, Camera, CirclePlay } from 'lucide-react';

type MilestoneRow = { views: string; payout: string };
type Platform = 'instagram' | 'youtube';

const inputClass = 'w-full rounded-xl border border-[#E2DAE8] bg-[#FCFBFE] px-4 py-3.5 text-sm text-[#252133] outline-none transition placeholder:text-[#A7A0AF] focus:border-[#A88BFA] focus:ring-4 focus:ring-[#A88BFA]/10';
const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function CreateCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [totalBudget, setTotalBudget] = useState('10000');
  const [milestones, setMilestones] = useState<MilestoneRow[]>([{ views: '10000', payout: '500' }, { views: '50000', payout: '2000' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const budget = Number(totalBudget);
  const highestReward = useMemo(() => Math.max(0, ...milestones.map(row => Number(row.payout) || 0)), [milestones]);

  const updateMilestone = (index: number, field: keyof MilestoneRow, value: string) => setMilestones(previous => previous.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const addMilestone = () => { if (milestones.length < 10) setMilestones(previous => [...previous, { views: '', payout: '' }]); };
  const removeMilestone = (index: number) => { if (milestones.length > 1) setMilestones(previous => previous.filter((_, i) => i !== index)); };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsedMilestones = milestones.map(row => ({ views: Number(row.views), payout: Number(row.payout) }));
    if (name.trim().length < 3) return setError('Campaign name must have at least 3 characters.');
    if (description.trim().length < 20 || description.trim().length > 1000) return setError('Campaign description must be between 20 and 1000 characters.');
    if (!totalBudget.trim() || !Number.isSafeInteger(budget) || budget <= 0) return setError('Enter a valid positive campaign budget.');
    if (milestones.some(row => !row.views.trim() || !row.payout.trim()) || parsedMilestones.some(row => !Number.isSafeInteger(row.views) || !Number.isSafeInteger(row.payout) || row.views <= 0 || row.payout <= 0 || row.payout > budget)) return setError('Enter positive whole-number milestones with payouts not exceeding the budget.');
    if (parsedMilestones.some((row, i) => i > 0 && (row.views <= parsedMilestones[i - 1].views || row.payout <= parsedMilestones[i - 1].payout))) return setError('Views and total payouts must strictly increase with each milestone.');
    setLoading(true);
    try {
      const response = await fetch('/api/brand/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), platform, totalBudget: budget, milestones: parsedMilestones }),
      });
      if (!(response.headers.get('content-type') ?? '').includes('application/json')) throw new Error('Campaign API returned an unexpected response. Check the Next.js API route.');
      const result: { success: boolean; message?: string; data?: { id?: string } } = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message ?? 'Unable to create campaign.');
      router.push(result.data?.id ? `/brand/campaigns/${result.data.id}` : '/brand/campaigns');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1450px] space-y-7 px-5 py-8 text-[#252133] sm:px-8 xl:px-10">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#895FDB]">Campaign Studio</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Create a campaign<span className="text-[#A88BFA]">.</span></h1>
        <p className="mt-3 text-sm text-[#8E8795]">Tell creators what to make, set your rewards, and launch your campaign.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.85fr)]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[#EAE5E0] bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4 border-b border-[#F0ECF0] pb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EDFC] text-[#835DD3]"><Sparkles size={21} /></div>
              <div><h2 className="text-lg font-black">Campaign details</h2><p className="mt-1 text-xs text-[#948D9B]">Give your campaign a clear identity and creative brief.</p></div>
            </div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="campaign-name" className="mb-2 block text-xs font-bold">Campaign name <span className="text-[#8E66DD]">*</span></label><input id="campaign-name" className={inputClass} value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={100} required placeholder="e.g. Summer Sneaker Launch" /></div>
              <div>
                <label htmlFor="campaign-description" className="mb-2 block text-xs font-bold">Creator brief / description <span className="text-[#8E66DD]">*</span></label>
                <textarea id="campaign-description" className={`${inputClass} min-h-[144px] resize-y leading-6`} value={description} onChange={e => setDescription(e.target.value)} minLength={20} maxLength={1000} required placeholder="Describe the product, creative guidelines, what to highlight, hashtags or campaign expectations..." />
                <div className="mt-2 flex justify-between gap-3 text-[11px] text-[#9F98A6]"><span>Creators will see these instructions before submitting.</span><span>{description.length}/1000</span></div>
              </div>
              <div><label htmlFor="campaign-platform" className="mb-2 block text-xs font-bold">Content platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {([{ id: 'instagram', label: 'Instagram', icon: Camera }, { id: 'youtube', label: 'YouTube', icon: CirclePlay }] as const).map(item => {
                    const Icon = item.icon;
                    return <button key={item.id} type="button" onClick={() => setPlatform(item.id)} className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-bold transition ${platform === item.id ? 'border-[#A88BFA] bg-[#F5EFFD] text-[#6544AB] shadow-[0_0_0_2px_rgba(168,139,250,0.08)]' : 'border-[#E9E4EB] bg-[#FCFBFE] text-[#726979] hover:border-[#CAB7E8]'}`}><Icon size={20} />{item.label}{platform === item.id && <CircleCheck size={15} className="ml-auto" />}</button>;
                  })}
                </div>
                <select id="campaign-platform" className="sr-only" tabIndex={-1} value={platform} onChange={e => setPlatform(e.target.value as Platform)}><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#EAE5E0] bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4 border-b border-[#F0ECF0] pb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9F5E1] text-[#5C8A37]"><Wallet size={21} /></div>
              <div><h2 className="text-lg font-black">Campaign budget</h2><p className="mt-1 text-xs text-[#948D9B]">Maximum amount available for creator milestone rewards.</p></div>
            </div>
            <div className="mt-6"><label htmlFor="total-budget" className="mb-2 block text-xs font-bold">Total budget (₹)</label><input id="total-budget" className={inputClass} type="number" min="1" step="1" required value={totalBudget} onChange={e => setTotalBudget(e.target.value)} /></div>
          </section>

          <section className="rounded-[24px] border border-[#EAE5E0] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0ECF0] pb-6">
              <div><h2 className="text-lg font-black">Payout milestones</h2><p className="mt-2 max-w-lg text-xs leading-5 text-[#948D9B]">Creators earn their highest crossed milestone. Each upgrade only pays the difference.</p></div>
              <span className="rounded-full bg-[#F3EEFE] px-3 py-1.5 text-xs font-bold text-[#8054E9]">{milestones.length} / 10</span>
            </div>
            <div className="mt-6 space-y-4">
              {milestones.map((row, index) => (
                <div key={index} className="rounded-2xl border border-[#E9E4EE] bg-[#FCFBFE] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE6FB] text-xs font-black text-[#835DD3]">{index + 1}</span><span className="text-sm font-black">Milestone {index + 1}</span></div>{milestones.length > 1 && <button type="button" onClick={() => removeMilestone(index)} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800"><Trash2 size={14} /> Remove</button>}</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label htmlFor={`milestone-views-${index}`} className="mb-2 block text-xs font-semibold text-[#797183]">Required views</label><input id={`milestone-views-${index}`} className={inputClass} type="number" min="1" step="1" required value={row.views} onChange={e => updateMilestone(index, 'views', e.target.value)} placeholder="10000" /></div>
                    <div><label htmlFor={`milestone-payout-${index}`} className="mb-2 block text-xs font-semibold text-[#797183]">Total reward (₹)</label><input id={`milestone-payout-${index}`} className={inputClass} type="number" min="1" step="1" required value={row.payout} onChange={e => updateMilestone(index, 'payout', e.target.value)} placeholder="500" /></div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMilestone} disabled={milestones.length >= 10} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#BDA4EB] bg-[#F8F4FF] px-5 py-3.5 text-sm font-bold text-[#8054E9] transition hover:bg-[#EFE7FC] disabled:opacity-50"><Plus size={18} /> Add milestone</button>
          </section>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#191628] px-7 py-4 text-sm font-black text-white transition hover:bg-[#352D48] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating campaign...' : 'Launch Campaign'}<ArrowRight size={18} /></button>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[110px]">
          <section className="overflow-hidden rounded-[24px] border border-[#EAE5E0] bg-white">
            <div className="bg-[#191628] px-6 py-6 text-white"><span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C8F36B]">Live preview</span><h2 className="mt-3 break-words text-xl font-black">{name.trim() || 'Your next big campaign'}</h2><p className="mt-2 text-xs capitalize text-[#CEC6DB]">{platform} · New campaign</p></div>
            <div className="space-y-5 p-6">
              <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-6 text-[#867D8E]">{description.trim() || 'Your creator brief will appear here.'}</p>
              <div className="border-t border-[#F0ECF0] pt-5"><p className="text-xs text-[#948D9B]">Total campaign allocation</p><p className="mt-2 text-3xl font-black">{Number.isFinite(budget) && budget > 0 ? currency(budget) : '₹0'}</p></div>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#F6F2FC] p-4"><p className="text-[11px] text-[#8A7D98]">Milestones</p><p className="mt-2 text-xl font-black">{milestones.length}</p></div><div className="rounded-xl bg-[#F2F8E9] p-4"><p className="text-[11px] text-[#71856A]">Top reward</p><p className="mt-2 text-xl font-black">{currency(highestReward)}</p></div></div>
            </div>
          </section>
          <section className="rounded-[20px] border border-[#DDD4ED] bg-[#F6F0FD] p-5"><div className="flex items-center gap-2 text-sm font-black text-[#644B90]"><CircleHelp size={18} /> How rewards work</div><p className="mt-3 text-xs leading-6 text-[#81728F]">A creator reaching 50K views with a ₹2,000 milestone earns ₹2,000 total, not the sum of all prior rewards. Your total payouts cannot exceed the campaign budget.</p></section>
        </aside>
      </form>
    </main>
  );
}
