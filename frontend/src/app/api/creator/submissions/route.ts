import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Authentication required. Please sign in.' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('campaignId' in body) || !('postUrl' in body) || typeof body.campaignId !== 'string' || typeof body.postUrl !== 'string') {
    return NextResponse.json({ success: false, message: 'Campaign ID and post URL are required.' }, { status: 400 });
  }

  try {
    const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
    const response = await fetch(`${backendUrl}/api/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: body.campaignId, postUrl: body.postUrl }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    const result = await response.json().catch(() => null);
    if (!result || typeof result !== 'object') return NextResponse.json({ success: false, message: 'Unexpected response from backend.' }, { status: 502 });
    return NextResponse.json(result, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Cannot connect to backend. Please try again.' }, { status: 503 });
  }
}
