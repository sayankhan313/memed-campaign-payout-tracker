"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

type NavbarProps = {
  minimal?: boolean;
};

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#for-brands", label: "For Brands" },
  { href: "/#for-creators", label: "For Creators" },
  { href: "/#why-memed", label: "Why Meme’d" },
];

const container =
  "mx-auto w-[calc(100%-40px)] max-w-[1180px] sm:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]";

export default function Navbar({ minimal = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#191628]/95 text-[#F7F5F0] backdrop-blur-xl">
      <div className={`${container} flex min-h-[82px] items-center justify-between gap-5`}>
        <BrandLogo />

        {minimal ? (
          <nav className="flex items-center gap-4 text-xs sm:gap-6 sm:text-sm">
            <Link href="/" className="text-[#C6C0D1] hover:text-white">
              ← Back to Home
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white/25 px-4 py-2.5 hover:border-[#A88BFA]"
            >
              Log In ↗
            </Link>
          </nav>
        ) : (
          <>
            <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-[#C6C0D1] transition-colors hover:text-[#C8F36B]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-5 sm:flex">
              <Link href="/login" className="text-sm hover:text-[#C8F36B]">
                Log In
              </Link>

              <Link
                href="/choose-role"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#C8F36B] px-6 text-sm font-bold text-[#191628] hover:bg-[#D9FF8D]"
              >
                Get Started ↗
              </Link>
            </div>

            <button
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-11 place-items-center rounded-xl border border-white/20 sm:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </>
        )}
      </div>

      {!minimal && menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className={`${container} flex flex-col gap-4 border-t border-white/10 py-5 sm:hidden`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-[#D7D1E0]"
            >
              {link.label}
            </Link>
          ))}

          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Log In
          </Link>

          <Link
            href="/choose-role"
            onClick={() => setMenuOpen(false)}
            className="rounded-full bg-[#C8F36B] px-5 py-3 text-center font-bold text-[#191628]"
          >
            Get Started →
          </Link>
        </nav>
      )}
    </header>
  );
}