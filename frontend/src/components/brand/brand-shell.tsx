
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BrandSidebar from './brand-sidebar';
import BrandHeader from './brand-header';

export default function BrandShell({ children, brandName }: { children: ReactNode; brandName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError('');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out. Please try again.');

      setMenuOpen(false);
      router.replace('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Logout failed.');
      setLoggingOut(false);
    }
  };

  const sidebarProps = {
    pathname,
    brandName,
    onNavigate: () => setMenuOpen(false),
    onLogout: logout,
    loggingOut,
    logoutError,
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#252133]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:block">
        <BrandSidebar {...sidebarProps} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation overlay"
            className="absolute inset-0 h-full w-full bg-[#14101D]/65 backdrop-blur-[3px]"
          />

          <aside role="dialog" aria-label="Brand navigation" aria-modal="true" className="relative h-full w-[280px] max-w-[85vw] shadow-2xl">
            <BrandSidebar {...sidebarProps} mobile />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:ml-[248px]">
        <BrandHeader pathname={pathname} onOpenMenu={() => setMenuOpen(true)} />
        <div className="min-h-[calc(100vh-82px)]">{children}</div>
      </div>
    </div>
  );
}
