
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import BrandShell from '@/components/brand/brand-shell';

export const instant = false;

export default async function BrandLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get('memed_access_token')?.value;

  if (!token) redirect('/login');

  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, '');
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-6 text-center">
        <h1 className="text-2xl font-black text-[#191628]">Unable to connect to the server</h1>
        <p className="mt-3 text-sm text-[#817A89]">Please check that the Meme’d backend is running.</p>
      </main>
    );
  }

  if (response.status === 401) redirect('/login');
  if (!response.ok) throw new Error('Unable to verify Brand account');

  const result: { data?: { role?: string; name?: string } } = await response.json();

  if (result.data?.role !== 'brand') redirect('/choose-role');

  return <BrandShell brandName={result.data?.name?.trim() || 'Brand Workspace'}>{children}</BrandShell>;
}
