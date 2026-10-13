import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


type CreatorSubmission = { id: string };
type MineResult = { success?: boolean; data?: CreatorSubmission[] };

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (process.env.ENABLE_DEMO_VIEW_SIMULATOR !== 'true') {
    return NextResponse.json({ success: false, message: 'Demo simulator is disabled.' }, { status: 404 });
  }

  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Please sign in as a Creator.' }, { status: 401 });

  const { id } = await context.params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ success: false, message: 'Invalid submission ID.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('views' in body) || typeof body.views !== 'number' || !Number.isSafeInteger(body.views) || body.views < 0 || body.views > 1000000000) {
    return NextResponse.json({ success: false, message: 'Views must be a non-negative whole number up to 1,000,000,000.' }, { status: 400 });
  }

  const views = body.views;
  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');

  try {
    const mineResponse = await fetch(`${backendUrl}/api/submissions/mine`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (mineResponse.status === 401 || mineResponse.status === 403) {
      return NextResponse.json({ success: false, message: 'Sign in with your Creator account.' }, { status: mineResponse.status });
    }
    if (!mineResponse.ok) return NextResponse.json({ success: false, message: 'Unable to check submission ownership.' }, { status: 502 });

    const mine: MineResult = await mineResponse.json().catch(() => ({}));
    if (!mine.success || !Array.isArray(mine.data)) {
      return NextResponse.json({ success: false, message: 'Unable to verify Creator submissions.' }, { status: 502 });
    }

    if (!mine.data.some(item => item.id === id)) {
      return NextResponse.json({ success: false, message: 'Submission not found.' }, { status: 404 });
    }

    const payoutResponse = await fetch(`${backendUrl}/api/submissions/${id}/views`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ views }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    const payout: unknown = await payoutResponse.json().catch(() => null);
    if (!payout || typeof payout !== 'object') {
      return NextResponse.json({ success: false, message: 'Unexpected response from payout engine.' }, { status: 502 });
    }

    return NextResponse.json(payout, { status: payoutResponse.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Cannot connect to the payout service. Try again.' }, { status: 503 });
  }
}
