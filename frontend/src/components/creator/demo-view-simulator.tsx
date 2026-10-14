
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FlaskConical, Loader2, Play, TrendingUp, Zap } from 'lucide-react';
import { formatINR, formatNumber } from '@/lib/creator-format';

type DemoMode = 'MILESTONE_DEMO' | 'SPIKE_DEMO';

type SimulationResponse = {
  success?: boolean;
  message?: string;
  error?: string | { message?: string };
  data?: { views: number; totalEarned: number; additionalPayout: number; campaignBudgetRemaining: number };
};

type DemoViewSimulatorProps = { submissionId: string; currentViews: number };

type CompletedSimulation = {
  mode: DemoMode;
  previousViews: number;
  data: NonNullable<SimulationResponse['data']>;
};

const MILESTONE_PRESETS = [10000, 50000, 100000];
const SPIKE_PRESETS = [100000, 200000];
const SPIKE_THRESHOLD = 100000;
const MAX_VIEWS = 1000000000;

export default function DemoViewSimulator({ submissionId, currentViews }: DemoViewSimulatorProps) {
  const router = useRouter();
  const [views, setViews] = useState(currentViews);
  const [mode, setMode] = useState<DemoMode>('MILESTONE_DEMO');
  const [customViews, setCustomViews] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CompletedSimulation | null>(null);

  const isSpikeMode = mode === 'SPIKE_DEMO';

  function changeMode(nextMode: DemoMode) {
    if (pending || nextMode === mode) return;
    setMode(nextMode);
    setCustomViews('');
    setError('');
    setResult(null);
  }

  async function simulate(nextViews: number) {
    if (pending) return;
    setError('');
    setResult(null);

    if (!Number.isSafeInteger(nextViews) || nextViews < 0 || nextViews > MAX_VIEWS) {
      setError('Enter a whole number of views between 0 and 1,000,000,000.');
      return;
    }

    if (nextViews <= views) {
      setError(`Enter more than ${formatNumber(views)} views. View counts cannot go backwards.`);
      return;
    }

    const increase = nextViews - views;

    if (isSpikeMode && increase < SPIKE_THRESHOLD) {
      setError(`Spike Detection Demo requires an increase of at least ${formatNumber(SPIKE_THRESHOLD)} views.`);
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/creator/submissions/${encodeURIComponent(submissionId)}/simulate-views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views: nextViews, mode }),
      });

      const body: SimulationResponse = await response.json().catch(() => ({}));

      if (!response.ok || !body.success || !body.data) {
        const detail = typeof body.error === 'string' ? body.error : body.error?.message;
        throw new Error(body.message || detail || 'View simulation failed. Please try again.');
      }

      setResult({ mode, previousViews: views, data: body.data });
      setViews(body.data.views);
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
    if (!customViews.trim()) {
      setError('Enter a view count.');
      return;
    }

    void simulate(Number(customViews));
  }

  return (
    <section className="rounded-2xl border border-dashed border-[#C8B6E6] bg-[#FAF7FF] px-4 py-4 sm:px-5" aria-label="Demo view simulator">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-[#624393]">
          <FlaskConical size={18} />
          Demo View Simulator
        </div>
        <span className="rounded-full bg-[#EDE3FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#7453AB]">
          Simulated · Not verified
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-[#81718D]">
        Test campaign milestones and unusual view activity without Instagram or YouTube API access. Views and payouts are simulated.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Select simulation mode">
        <button
          type="button"
          aria-pressed={!isSpikeMode}
          disabled={pending}
          onClick={() => changeMode('MILESTONE_DEMO')}
          className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${!isSpikeMode ? 'border-[#A88BFA] bg-white shadow-sm' : 'border-[#E3D9EF] bg-[#F5F0FB] hover:border-[#C9B6E4]'}`}
        >
          <span className="flex items-center gap-2 text-xs font-black text-[#4F367A]">
            <TrendingUp size={15} />
            Milestone Demo
          </span>
          <span className="mt-1.5 block text-[11px] leading-4 text-[#85758F]">
            Test 10K, 50K and 100K payouts without anomaly flags.
          </span>
        </button>

        <button
          type="button"
          aria-pressed={isSpikeMode}
          disabled={pending}
          onClick={() => changeMode('SPIKE_DEMO')}
          className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${isSpikeMode ? 'border-[#E5AD62] bg-[#FFFCF5] shadow-sm' : 'border-[#E3D9EF] bg-[#F5F0FB] hover:border-[#C9B6E4]'}`}
        >
          <span className="flex items-center gap-2 text-xs font-black text-[#9A611F]">
            <Zap size={15} />
            Spike Detection Demo
          </span>
          <span className="mt-1.5 block text-[11px] leading-4 text-[#85758F]">
            Simulate a sudden view surge and generate an audit flag.
          </span>
        </button>
      </div>

      <div className={`mt-4 rounded-xl border px-3 py-3 ${isSpikeMode ? 'border-[#F2DCB8] bg-[#FFF9EE]' : 'border-[#E3D8F2] bg-white'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#8A7A97]">Current submission views</span>
          <span className="text-lg font-black tabular-nums text-[#252133]">{formatNumber(views)}</span>
        </div>

        <p className="mt-1 text-[11px] leading-5 text-[#82748B]">
          {isSpikeMode
            ? 'A jump of at least 100,000 views in one update triggers the simulated anomaly audit. Payout rules remain unchanged.'
            : 'Choose a milestone or enter a custom total. This demo mode does not create spike warnings.'}
        </p>
      </div>

      {isSpikeMode ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SPIKE_PRESETS.map(increase => {
            const targetViews = views + increase;
            return (
              <button
                key={increase}
                type="button"
                disabled={pending || targetViews > MAX_VIEWS}
                onClick={() => void simulate(targetViews)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6C48C] bg-white px-3 py-2 text-xs font-black text-[#9A611F] transition hover:border-[#D8A451] hover:bg-[#FFF5E4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                +{formatNumber(increase)} views
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {MILESTONE_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              disabled={pending || preset <= views}
              onClick={() => void simulate(preset)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD0F3] bg-white px-3 py-2 text-xs font-black text-[#6845A2] transition hover:border-[#AF96D9] hover:bg-[#F2EAFF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} />}
              {formatNumber(preset)} views
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submitCustom} className="mt-3 flex flex-wrap gap-2">
        <label htmlFor={`sim-views-${submissionId}`} className="sr-only">Custom total view count</label>
        <input
          id={`sim-views-${submissionId}`}
          type="number"
          min={views + (isSpikeMode ? SPIKE_THRESHOLD : 1)}
          max={MAX_VIEWS}
          step="1"
          inputMode="numeric"
          placeholder={isSpikeMode ? 'Custom spike total views' : 'Custom total views'}
          value={customViews}
          onChange={event => setCustomViews(event.target.value)}
          disabled={pending}
          className="min-w-[170px] flex-1 rounded-xl border border-[#DDD0F3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A88BFA] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !customViews.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#191628] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#3B304F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : isSpikeMode ? <Zap size={15} /> : <TrendingUp size={15} />}
          {pending ? 'Updating...' : isSpikeMode ? 'Run spike test' : 'Simulate views'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-3 rounded-xl border px-3 py-3 text-xs leading-6 ${result.mode === 'SPIKE_DEMO' ? 'border-[#F0CC91] bg-[#FFF4DF] text-[#885617]' : 'border-[#CEE8AD] bg-[#F0FADD] text-[#466B2E]'}`}
        >
          <p className="flex items-center gap-2 font-black">
            {result.mode === 'SPIKE_DEMO' ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
            {result.mode === 'SPIKE_DEMO' ? 'Unusual view spike recorded' : 'Milestone simulation completed'}
          </p>
          <p>
            {formatNumber(result.previousViews)} → {formatNumber(result.data.views)} views
            {' · '}+{formatNumber(result.data.views - result.previousViews)} new views
          </p>
          <p>
            New reward: {formatINR(result.data.additionalPayout)}
            {' · '}Total earned: {formatINR(result.data.totalEarned)}
          </p>
          <p>Campaign budget remaining: {formatINR(result.data.campaignBudgetRemaining)}</p>
          {result.mode === 'SPIKE_DEMO' && (
            <p className="mt-1 font-semibold">
              Simulated anomaly flagged for audit. This is not proof of fraudulent activity, and payout processing follows the existing budget rules.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
