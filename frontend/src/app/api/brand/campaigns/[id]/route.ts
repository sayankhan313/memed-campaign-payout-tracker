import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const token = (await cookies()).get('memed_access_token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 }); }

  const { id } = await params;
  const actionPath = typeof body === 'object' && body !== null && 'action' in body ? '/status' : '';
  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
  try {
    const response = await fetch(`${backendUrl}/api/campaigns/${encodeURIComponent(id)}${actionPath}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    });
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) return NextResponse.json({ success: false, message: 'Unexpected backend response' }, { status: 502 });
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Cannot connect to backend' }, { status: 502 });
  }
}
