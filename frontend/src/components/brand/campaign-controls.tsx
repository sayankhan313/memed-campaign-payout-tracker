'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Archive, CheckCircle2, CircleAlert, Pencil, Play, Pause, X } from 'lucide-react';
import type { BrandCampaign, CampaignAction, CampaignStatus } from '@/lib/brand';

type Props = { campaign: BrandCampaign };

const statuses: Record<CampaignStatus, string> = {
  live: 'Accepting creator submissions',
  paused: 'New submissions are paused; existing rewards can be settled',
  completed: 'Closed to new submissions; existing rewards can be settled',
  archived: 'Read-only record; no further view or payout updates',
};

export default function CampaignControls({ campaign }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description ?? '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const exhausted = campaign.budgetExhausted || campaign.budgetSpent >= campaign.totalBudget;
  const editable = status === 'live' || status === 'paused';
  const controlClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDD5E6] bg-white px-4 py-3 text-xs font-bold text-[#443853] transition hover:border-[#B39BDF] hover:text-[#7851C8] disabled:cursor-not-allowed disabled:opacity-50';

  async function sendUpdate(body: unknown) {
    const response = await fetch(`/api/brand/campaigns/${campaign.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) throw new Error('Unexpected server response');
    const result: { success: boolean; message?: string; data?: BrandCampaign } = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message ?? 'Campaign update failed');
    return result;
  }

  async function doAction(action: CampaignAction) {
    const confirmations: Partial<Record<CampaignAction, string>> = {
      complete: 'Complete this campaign? New creators will not be able to submit posts. Existing submission payouts may still be processed.',
      archive: 'Archive this campaign permanently? All future view updates and payouts will stop. Only archive after settling outstanding creator rewards. Historical records will remain available.',
    };
    if (confirmations[action] && !window.confirm(confirmations[action])) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await sendUpdate({ action });
      if (result.data) setStatus(result.data.status);
      setSuccess(`Campaign ${action === 'complete' ? 'completed' : action === 'archive' ? 'archived' : action === 'pause' ? 'paused' : 'resumed'} successfully.`);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update campaign');
    } finally { setBusy(false); }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (name.trim().length < 3 || name.trim().length > 100) return setError('Name must contain 3–100 characters.');
    if (description.trim().length > 1000) return setError('Description cannot exceed 1000 characters.');
    setBusy(true);
    try {
      await sendUpdate({ name: name.trim(), description: description.trim() });
      setSuccess('Campaign details updated successfully.');
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save details');
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-[22px] border border-[#EAE5E0] bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-lg font-black">Manage Campaign</h2><p className="mt-1.5 text-xs leading-5 text-[#898192]">{statuses[status]}</p></div>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase ${status === 'live' ? 'bg-[#EAF7DC] text-[#46752D]' : status === 'paused' ? 'bg-[#FFF2DB] text-[#946721]' : 'bg-[#F0ECF4] text-[#6B6276]'}`}>{status}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {status === 'live' && <button type="button" disabled={busy} className={controlClass} onClick={() => doAction('pause')}><Pause size={16} /> Pause</button>}
        {status === 'paused' && <button type="button" disabled={busy || exhausted} className={controlClass} onClick={() => doAction('resume')} title={exhausted ? 'Budget exhausted' : undefined}><Play size={16} /> Resume</button>}
        {editable && <button type="button" disabled={busy} className={controlClass} onClick={() => setEditing(previous => !previous)}><Pencil size={16} /> Edit Details</button>}
        {(status === 'live' || status === 'paused') && <button type="button" disabled={busy} className={controlClass} onClick={() => doAction('complete')}><CheckCircle2 size={16} /> Mark Completed</button>}
        {status === 'completed' && <button type="button" disabled={busy} className={`${controlClass} text-[#9A6239]`} onClick={() => doAction('archive')}><Archive size={16} /> Archive</button>}
      </div>
      {exhausted && <div className="mt-5 flex gap-2 rounded-xl bg-[#FFF4E2] px-4 py-3 text-xs font-semibold text-[#91602B]"><CircleAlert size={17} className="shrink-0" /> Budget exhausted. New submissions and Resume are unavailable.</div>}
      {status === 'archived' && <div className="mt-5 rounded-xl bg-[#F5F2F7] px-4 py-3 text-xs text-[#7B7087]">This campaign is archived. Its financial history remains visible, but further changes are disabled.</div>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
      {success && <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-800">{success}</p>}
      {editing && editable && (
        <form onSubmit={saveDetails} className="mt-6 space-y-4 rounded-2xl border border-[#EAE3F3] bg-[#FBF9FF] p-5">
          <div><label htmlFor="edit-name" className="mb-2 block text-xs font-bold">Campaign name</label><input id="edit-name" required minLength={3} maxLength={100} value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-[#DDD3E8] bg-white px-4 py-3 text-sm outline-none focus:border-[#A88BFA]" /></div>
          <div><label htmlFor="edit-description" className="mb-2 block text-xs font-bold">Campaign description</label><textarea id="edit-description" value={description} maxLength={1000} onChange={e => setDescription(e.target.value)} rows={5} className="w-full rounded-xl border border-[#DDD3E8] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#A88BFA]" /><p className="mt-1 text-right text-[11px] text-[#958D9B]">{description.length}/1000</p></div>
          <p className="text-xs text-[#847990]">Budget, platform and payout milestones are locked to protect creator reward terms.</p>
          <div className="flex flex-wrap gap-3"><button disabled={busy} type="submit" className="rounded-xl bg-[#191628] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save Changes'}</button><button type="button" disabled={busy} onClick={() => { setEditing(false); setName(campaign.name); setDescription(campaign.description ?? ''); }} className={controlClass}><X size={15} /> Cancel</button></div>
        </form>
      )}
    </section>
  );
}
