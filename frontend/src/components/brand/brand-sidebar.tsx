
'use client';

import Link from 'next/link';
import {
  ArrowUpRight, ChartNoAxesCombined, ChevronRight,
  CircleUserRound, LayoutDashboard, LogOut,
  Megaphone, PlusSquare, Sparkles, X,
} from 'lucide-react';

type BrandSidebarProps = {
  pathname: string;
  brandName: string;
  mobile?: boolean;
  onNavigate: () => void;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError: string;
};

const navigation = [
  { label: 'Overview', href: '/brand/dashboard', icon: LayoutDashboard },
  { label: 'My Campaigns', href: '/brand/campaigns', icon: Megaphone },
  { label: 'Create Campaign', href: '/brand/campaigns/new', icon: PlusSquare },
  { label: 'Analytics', href: '/brand/analytics', icon: ChartNoAxesCombined },
];

export default function BrandSidebar({
  pathname, brandName, mobile = false, onNavigate, onLogout, loggingOut, logoutError,
}: BrandSidebarProps) {
  const isActive = (href: string) => {
    if (href === '/brand/campaigns') {
      return pathname === href || (pathname.startsWith('/brand/campaigns/') && pathname !== '/brand/campaigns/new');
    }

    return pathname === href;
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#191628] text-[#D6D0E2]">
      <div className="pointer-events-none absolute -left-36 -top-32 h-72 w-72 rounded-full bg-[#8B68DB]/10 blur-3xl" />

      <div className="relative flex shrink-0 items-start justify-between px-6 pb-8 pt-8">
        <Link href="/brand/dashboard" onClick={onNavigate} className="group inline-flex flex-col">
          <span className="text-[33px] font-black leading-none tracking-[-0.08em] text-white">
            meme<span className="text-[#C8F36B]">’d.</span>
          </span>
          <span className="mt-3 pl-0.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#ADA4C0]">
            Brand Studio
          </span>
        </Link>

        {mobile && (
          <button type="button" onClick={onNavigate} aria-label="Close navigation" className="rounded-xl border border-white/10 p-2.5 text-white hover:bg-white/10">
            <X size={19} />
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3.5">
        <div className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#81778F]">
          Workspace
        </div>

        <nav aria-label="Brand navigation" className="space-y-1.5">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[#332B48] text-white shadow-[inset_0_0_0_1px_rgba(168,139,250,0.10)]'
                    : 'text-[#AFA6C0] hover:bg-[#292338] hover:text-white'
                }`}
              >
                {active && <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[#C8F36B]" />}
                <Icon size={18} strokeWidth={active ? 2.3 : 1.8} className={active ? 'text-[#C8F36B]' : 'text-[#A69DB7] group-hover:text-[#C8F36B]'} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={15} className="text-[#C8F36B]" />}
              </Link>
            );
          })}
        </nav>

        <div className="my-7 h-px bg-[#393148]" />

        <div className="relative overflow-hidden rounded-2xl border border-[#463C58] bg-[#292238] p-5">
          <div className="absolute -right-9 -top-10 h-28 w-28 rounded-full border-[20px] border-[#A88BFA]/10" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8F36B] text-[#191628]">
            <Sparkles size={20} />
          </div>
          <h3 className="relative mt-4 text-sm font-extrabold text-white">Make your next move.</h3>
          <p className="relative mt-2 text-xs leading-5 text-[#B4A9C6]">
            Launch campaigns, track views and reward creators.
          </p>
          <Link href="/brand/campaigns/new" onClick={onNavigate} className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#C8F36B] hover:text-white">
            Create campaign <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-[#383045] px-4 pb-5 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#241F32] px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A88BFA] text-[#191628]">
            <CircleUserRound size={23} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-extrabold text-white" title={brandName}>{brandName}</p>
            <p className="mt-0.5 text-[11px] text-[#AFA5BF]">Brand account</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#C8F36B]" aria-label="Brand workspace" />
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-[#AFA6C0] transition hover:bg-[#332B48] hover:text-white disabled:opacity-50"
        >
          <LogOut size={17} />
          {loggingOut ? 'Signing out...' : 'Log out'}
        </button>

        {logoutError && <p role="alert" className="px-3 pt-2 text-xs text-red-300">{logoutError}</p>}
      </div>
    </div>
  );
}
