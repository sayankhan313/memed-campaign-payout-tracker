
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const isBrowserNavigation = request.headers.get('accept')?.includes('text/html') ?? false;

  const response = isBrowserNavigation
    ? NextResponse.redirect(new URL('/login', request.url), 303)
    : NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set({
    name: 'memed_access_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.headers.set('Cache-Control', 'no-store');

  return response;
}
