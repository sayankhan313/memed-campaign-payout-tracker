'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, Loader2, Play, TrendingUp } from 'lucide-react';
import { formatINR, formatNumber } from '@/lib/creator-format';

type SimulationResponse = {
  success?: boolean;
  message?: string;
  error?: string | { message?: string };
  data?: { views: number; totalEarned: number; additionalPayout: number; campaignBudgetRemaining: number };
};

type DemoViewSimulatorProps = { submissionId: string; currentViews: number };

const presets = [10000, 50000, 100000];

export default function DemoViewSimulator({ submissionId, currentViews }: DemoViewSimulatorProps) {
  const router = useRouter();
  const [views, setViews] = useState(currentViews);
  const [customViews, setCustomViews] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SimulationResponse['data'] | null>(null);

  async function simulate(nextViews: number) {
    if (pending) return;
    setError('');
    setResult(null);

    if (!Number.isSafeInteger(nextViews) || nextViews < 0 || nextViews > 1000000000) {
      setError('Enter a whole number of views between 0 and 1,000,000,000.');
      return;
    }

    if (nextViews <= views) {
      setError(`Enter more than ${formatNumber(views)} views. View counts cannot go backwards.`);
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/creator/submissions/${encodeURIComponent(submissionId)}/simulate-views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views: nextViews }),
      });
      const body: SimulationResponse = await response.json().catch(() => ({}));

      if (!response.ok || !body.success || !body.data) {
        const detail = typeof body.error === 'string' ? body.error : body.error?.message;
        throw new Error(body.message || detail || 'View simulation failed. Please try again.');
      }

      setViews(body.data.views);
      setResult(body.data);
      setCustomViews('');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to simulate views.');
    } finally {
      setPending(false);
    }
  }

  function submitCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customViews.trim()) return setError('Enter a view count.');
    void simulate(Number(customViews));
  }

  return (
    <section className="rounded-2xl border border-dashed border-[#C8B6E6] bg-[#FAF7FF] px-4 py-4 sm:px-5" aria-label="Demo view simulator">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-[#624393]"><FlaskConical size={18} />Demo View Simulator</div>
        <span className="rounded-full bg-[#EDE3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#7453AB]">Simulated · Not verified</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#81718D]">Test payout milestones without Instagram or YouTube API access. These are manually simulated views, not real social-media analytics or bank payments.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {presets.map(preset => (
          <button key={preset} type="button" disabled={pending || preset <= views} onClick={() => void simulate(preset)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD0F3] bg-white px-3 py-2 text-xs font-black text-[#6845A2] transition hover:border-[#AF96D9] hover:bg-[#F2EAFF] disabled:cursor-not-allowed disabled:opacity-40">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} />}{formatNumber(preset)} views
          </button>
        ))}
      </div>
      <form onSubmit={submitCustom} className="mt-3 flex flex-wrap gap-2">
        <label htmlFor={`sim-views-${submissionId}`} className="sr-only">Custom total view count</label>
        <input id={`sim-views-${submissionId}`} type="number" min={views + 1} max={1000000000} step="1" inputMode="numeric" placeholder="Custom total views" value={customViews} onChange={event => setCustomViews(event.target.value)} disabled={pending} className="min-w-[170px] flex-1 rounded-xl border border-[#DDD0F3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A88BFA] disabled:opacity-50" />
        <button type="submit" disabled={pending || !customViews.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#191628] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#3B304F] disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <TrendingUp size={15} />}{pending ? 'Updating...' : 'Simulate views'}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {result && <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-[#CEE8AD] bg-[#F0FADD] px-3 py-3 text-xs leading-6 text-[#466B2E]">
        <p className="font-black">Simulation saved: {formatNumber(result.views)} total views</p>
        <p>New reward: {formatINR(result.additionalPayout)} · Total earned: {formatINR(result.totalEarned)} · Campaign budget remaining: {formatINR(result.campaignBudgetRemaining)}</p>
      </div>}
    </section>
  );
}
