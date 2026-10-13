'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Link2, Loader2, ShieldCheck } from 'lucide-react';
import type { CreatorPlatform } from '@/lib/creator';

type SubmissionResult = { success?: boolean; message?: string; error?: string | { message?: string }; data?: { id?: string } };

export default function SubmitPostForm({ campaignId, platform }: { campaignId: string; platform: CreatorPlatform }) {
  const router = useRouter();
  const [postUrl, setPostUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError('');

    let validatedUrl: URL;
    try {
      validatedUrl = new URL(postUrl.trim());
    } catch {
      setError('Enter a valid post URL.');
      return;
    }

    const host = validatedUrl.hostname.toLowerCase();
    const allowedInstagram = host === 'instagram.com' || host === 'www.instagram.com';
    const allowedYouTube = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host);

    if (validatedUrl.protocol !== 'https:' || (platform === 'instagram' && !allowedInstagram) || (platform === 'youtube' && !allowedYouTube)) {
      setError(`Enter a valid HTTPS ${platform === 'instagram' ? 'Instagram' : 'YouTube'} post link.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/creator/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, postUrl: validatedUrl.toString() }),
      });
      const result: SubmissionResult = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const message = typeof result.error === 'string' ? result.error : result.error?.message;
        throw new Error(result.message || message || 'Unable to submit your post. Please try again.');
      }
      router.replace('/creator/submissions?submitted=1');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Submission failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div><label htmlFor="post-url" className="mb-2 block text-xs font-black text-[#5B5267]">Published {platform === 'instagram' ? 'Instagram Reel/Post' : 'YouTube Video'} URL</label><div className="flex items-center gap-3 rounded-xl border border-[#E2DCE6] bg-[#FBFAFC] px-4 focus-within:border-[#A88BFA]"><Link2 size={19} className="shrink-0 text-[#9075C2]" /><input id="post-url" name="postUrl" type="url" inputMode="url" placeholder={platform === 'instagram' ? 'https://www.instagram.com/reel/...' : 'https://www.youtube.com/watch?v=...'} className="min-w-0 w-full bg-transparent py-4 text-sm text-[#252133] outline-none placeholder:text-[#ABA3B2]" value={postUrl} onChange={event => setPostUrl(event.target.value)} required /></div></div>
      <p className="flex items-start gap-2 text-xs leading-6 text-[#8C8396]"><ShieldCheck size={15} className="mt-1 shrink-0 text-[#8F71CF]" />Only submit a public post that you own. The platform must match this campaign; duplicate links will be rejected.</p>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700">{error}</p>}
      <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8F36B] px-5 py-4 text-sm font-black text-[#191628] transition hover:bg-[#B8E65A] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}{loading ? 'Submitting post...' : 'Submit Post Link'}</button>
    </form>
  );
}
