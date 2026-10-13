
'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Camera, ChartNoAxesColumn, CirclePlay, Compass, LayoutDashboard, LogOut, Menu, Sparkles, Wallet, X } from 'lucide-react';

type CreatorShellProps = {
  children: ReactNode;
  creatorName: string;
  instagramUsername?: string;
  youtubeChannelUrl?: string;
};

const links = [
  { href: '/creator/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/creator/campaigns', label: 'Explore Campaigns', icon: Compass },
  { href: '/creator/submissions', label: 'My Submissions', icon: ChartNoAxesColumn },
  { href: '/creator/earnings', label: 'My Earnings', icon: Wallet },
];

export default function CreatorShell({ children, creatorName, instagramUsername, youtubeChannelUrl }: CreatorShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageName = links.find(link => pathname === link.href)?.label ?? (pathname.startsWith('/creator/campaigns/') ? 'Campaign Details' : 'Creator Studio');

  function sidebar() {
    return (
      <div className="flex h-full flex-col bg-[#191628] px-4 pb-6 pt-7 text-white">
        <div className="flex items-center justify-between px-3">
          <Link href="/creator/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 text-2xl font-black tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8F36B] text-[#191628]">
              <Sparkles size={20} />
            </div>
            meme’d<span className="text-[#C8F36B]">.</span>
          </Link>
          <button type="button" aria-label="Close navigation" className="rounded-lg p-2 lg:hidden" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="mx-3 mt-10 text-[10px] font-black uppercase tracking-[0.18em] text-[#A398BC]">
          Creator Workspace
        </div>

        <nav className="mt-4 space-y-1.5" aria-label="Creator navigation">
          {links.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href === '/creator/campaigns' && pathname.startsWith('/creator/campaigns/'));

            return (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition ${active ? 'bg-[#C8F36B] text-[#191628]' : 'text-[#C8C0D3] hover:bg-white/10 hover:text-white'}`}>
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-9 rounded-2xl border border-[#493E5A] bg-[#2A243A] p-4">
          <p className="text-xs font-bold text-[#C8F36B]">Your creator profile</p>
          <p className="mt-2 break-words text-sm font-black">{creatorName}</p>

          {instagramUsername && (
            <p className="mt-2 flex items-center gap-2 break-all text-xs text-[#CFC8DD]">
              <Camera size={14} />
              @{instagramUsername.replace(/^@/, '')}
            </p>
          )}

          {youtubeChannelUrl && (
            <p className="mt-2 flex items-center gap-2 text-xs text-[#CFC8DD]">
              <CirclePlay size={14} />
              YouTube linked in profile
            </p>
          )}

          {!instagramUsername && !youtubeChannelUrl && (
            <p className="mt-2 text-xs leading-5 text-[#B9B0C8]">
              You can submit posts without adding social profiles.
            </p>
          )}

          <p className="mt-3 text-[10px] text-[#A99FBC]">
            Social profiles are self-declared.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <Link href="/creator/campaigns" onClick={() => setMenuOpen(false)} className="mb-4 flex items-center justify-between rounded-xl bg-[#302740] px-4 py-3 text-xs font-black text-[#C8F36B] hover:bg-[#403253]">
            Find campaigns
            <ArrowUpRight size={16} />
          </Link>

          <form action="/api/auth/logout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#C5BDD2] transition hover:bg-white/10 hover:text-white">
              <LogOut size={18} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#252133]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:block">
        {sidebar()}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation overlay" className="absolute inset-0 h-full w-full bg-[#14101D]/65" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-[280px] max-w-[85vw] shadow-2xl">
            {sidebar()}
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:ml-[248px]">
        <header className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between gap-3 border-b border-[#E8E3DF] bg-[#F7F5F0]/95 px-5 backdrop-blur-xl sm:px-8 xl:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="rounded-xl border border-[#E8E3DF] bg-white p-3 lg:hidden">
              <Menu size={19} />
            </button>
            <div>
              <p className="text-[11px] font-bold text-[#918A98]">Creator Studio / Workspace</p>
              <h2 className="mt-1 text-base font-black">{pageName}</h2>
            </div>
          </div>

          <Link href="/creator/campaigns" className="inline-flex items-center gap-2 rounded-xl bg-[#C8F36B] px-4 py-3 text-xs font-black text-[#191628] hover:bg-[#B8E65A] sm:text-sm">
            <Compass size={17} />
            <span className="hidden sm:inline">Explore Campaigns</span>
            <span className="sm:hidden">Explore</span>
          </Link>
        </header>

        <div className="min-h-[calc(100vh-82px)]">{children}</div>
      </div>
    </div>
  );
}
