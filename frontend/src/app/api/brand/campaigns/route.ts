
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const token = (await cookies()).get('memed_access_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Authentication required. Please log in again.' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  try {
    const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');

    const response = await fetch(`${backendUrl}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      return NextResponse.json({
        success: false,
        message: 'Backend returned an unexpected response. Check backend server and API route.',
      }, { status: 502 });
    }

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({
      success: false,
      message: 'Cannot connect to backend. Please verify backend is running on port 5001.',
    }, { status: 502 });
  }
}
