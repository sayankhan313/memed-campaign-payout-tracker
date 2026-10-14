
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };
type DemoMode = 'MILESTONE_DEMO' | 'SPIKE_DEMO';

export async function POST(request: Request, context: RouteContext) {
  if (process.env.ENABLE_DEMO_VIEW_SIMULATOR !== 'true') {
    return NextResponse.json({ success: false, message: 'Demo simulator is disabled.' }, { status: 404 });
  }

  const token = (await cookies()).get('memed_access_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Please sign in as a Creator.' }, { status: 401 });
  }

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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, message: 'Invalid simulation request.' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const views = payload.views;
  const mode = payload.mode ?? 'MILESTONE_DEMO';

  if (typeof views !== 'number' || !Number.isSafeInteger(views) || views < 0 || views > 1000000000) {
    return NextResponse.json({
      success: false,
      message: 'Views must be a non-negative whole number up to 1,000,000,000.',
    }, { status: 400 });
  }

  if (mode !== 'MILESTONE_DEMO' && mode !== 'SPIKE_DEMO') {
    return NextResponse.json({ success: false, message: 'Invalid simulation mode.' }, { status: 400 });
  }

  const selectedMode: DemoMode = mode;
  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');

  try {
    const response = await fetch(`${backendUrl}/api/demo/submissions/${id}/views`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ views, mode: selectedMode }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    const result: unknown = await response.json().catch(() => null);

    if (!result || typeof result !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'Unexpected response from payout engine.',
      }, { status: 502 });
    }

    return NextResponse.json(result, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({
      success: false,
      message: 'Cannot connect to the payout service. Try again.',
    }, { status: 503 });
  }
}
