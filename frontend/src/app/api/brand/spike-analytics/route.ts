
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = (await cookies()).get('memed_access_token')?.value;

  if (!token) {
    return NextResponse.json({
      success: false,
      message: 'Authentication required',
    }, { status: 401 });
  }

  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/+$/, '');

  try {
    const response = await fetch(`${backendUrl}/api/campaigns/brand/spike-analytics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    const result: unknown = await response.json().catch(() => null);

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from analytics service',
      }, { status: 502 });
    }

    return NextResponse.json(result, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({
      success: false,
      message: 'Unable to connect to analytics service',
    }, { status: 503 });
  }
}
