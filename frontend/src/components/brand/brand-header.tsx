
'use client';

import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, LayoutDashboard,
  Menu, PlusSquare,
} from 'lucide-react';

type BrandHeaderProps = {
  pathname: string;
  onOpenMenu: () => void;
};

type HeaderPage = {
  title: string;
  description: string;
  section: string;
  back?: { href: string; label: string };
};

function getPageInfo(pathname: string): HeaderPage {
  if (pathname === '/brand/dashboard') {
    return {
      title: 'Overview',
      section: 'Dashboard',
      description: 'Your workspace at a glance',
    };
  }

  if (pathname === '/brand/campaigns/new') {
    return {
      title: 'Create Campaign',
      section: 'Campaigns',
      description: 'Build a creator campaign',
      back: { href: '/brand/dashboard', label: 'Back to Dashboard' },
    };
  }

  if (pathname === '/brand/campaigns') {
    return {
      title: 'My Campaigns',
      section: 'Campaigns',
      description: 'Manage your campaigns',
      back: { href: '/brand/dashboard', label: 'Back to Dashboard' },
    };
  }

  if (pathname.startsWith('/brand/campaigns/')) {
    return {
      title: 'Campaign Details',
      section: 'Campaigns',
      description: 'Budgets and payout milestones',
      back: { href: '/brand/campaigns', label: 'All Campaigns' },
    };
  }

  if (pathname === '/brand/analytics') {
    return {
      title: 'Analytics',
      section: 'Analytics',
      description: 'Campaign performance insights',
      back: { href: '/brand/dashboard', label: 'Back to Dashboard' },
    };
  }

  return {
    title: 'Brand Studio',
    section: 'Workspace',
    description: 'Campaign management',
  };
}

export default function BrandHeader({ pathname, onOpenMenu }: BrandHeaderProps) {
  const page = getPageInfo(pathname);
  const isCreatePage = pathname === '/brand/campaigns/new';

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E3DF] bg-[#F7F5F0]/95 backdrop-blur-xl">
      <div className="flex min-h-[82px] items-center justify-between gap-4 px-5 py-3 sm:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open Brand navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8E3DF] bg-white text-[#252133] hover:bg-[#F0EBFA] lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-medium text-[#928A9D]">
              <Link href="/brand/dashboard" className="hidden transition hover:text-[#8057D9] sm:inline">
                Brand Studio
              </Link>
              <ChevronRight size={13} className="hidden sm:block" />
              <span className="hidden sm:inline">{page.section}</span>
              {page.section !== page.title && (
                <>
                  <ChevronRight size={13} className="hidden sm:block" />
                  <span className="hidden truncate font-bold text-[#685F75] sm:inline">{page.title}</span>
                </>
              )}
              <span className="truncate font-bold text-[#685F75] sm:hidden">Brand Studio</span>
            </nav>

            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="truncate text-[15px] font-black tracking-tight text-[#252133] sm:text-[17px]">{page.title}</h2>
              <span className="hidden truncate text-xs text-[#A19AA6] xl:inline">{page.description}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {page.back && (
            <Link
              href={page.back.href}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E7E0DC] bg-white px-3 text-xs font-bold text-[#524A61] transition hover:border-[#B5A0E3] hover:text-[#7955C3] sm:px-4"
            >
              <ArrowLeft size={16} />
              <span className="hidden md:inline">{page.back.label}</span>
              <span className="md:hidden">Back</span>
            </Link>
          )}

          {!isCreatePage && (
            <Link
              href="/brand/campaigns/new"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C8F36B] px-3.5 text-xs font-black text-[#191628] shadow-[0_4px_14px_rgba(155,210,63,0.14)] transition hover:bg-[#B7E65A] sm:px-5 sm:text-sm"
            >
              <PlusSquare size={17} />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </Link>
          )}

          {isCreatePage && (
            <Link
              href="/brand/campaigns"
              className="hidden min-h-10 items-center gap-2 rounded-xl bg-[#191628] px-4 text-xs font-bold text-white transition hover:bg-[#342B49] sm:inline-flex"
            >
              <LayoutDashboard size={16} />
              My Campaigns
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
