"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "brand" | "creator";

type RoleOption = {
  id: Role;
  title: string;
  description: string;
  caption: string;
  image: string;
  imageAlt: string;
};

const roles: RoleOption[] = [
  {
    id: "brand",
    title: "I'M A BRAND",
    description: "Create campaigns, set view-based milestone rewards, manage budgets and work with creators.",
    caption: "CREATE. LAUNCH. GROW.",
    image: "/images/role-brand.webp",
    imageAlt: "Brand strategist planning a campaign at a creative workspace",
  },
  {
    id: "creator",
    title: "I'M A CREATOR",
    description: "Discover campaigns, submit content links, track views and earn milestone-based rewards.",
    caption: "CREATE. SHARE. EARN.",
    image: "/images/role-creator.webp",
    imageAlt: "Content creator recording a video using a smartphone and tripod",
  },
];

export default function ChooseRolePage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const router = useRouter();
  const selectedRoleName = selectedRole === "brand" ? "Brand" : "Creator";

  function handleContinue() {
    if (!selectedRole) return;
    router.push(`/signup?role=${selectedRole}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#191628] text-[#F7F5F0]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      <div aria-hidden="true" className="pointer-events-none absolute -top-60 left-1/2 size-[650px] -translate-x-1/2 rounded-full bg-[#A88BFA]/15 blur-3xl" />

      <header className="relative mx-auto flex h-20 max-w-7xl items-center justify-between border-b border-white/10 px-5 sm:h-24 sm:px-10">
        <Link href="/" aria-label="Meme'd home" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          <svg viewBox="0 0 32 32" className="size-7 text-[#C8F36B]" aria-hidden="true">
            <path d="M15 1 19 11 30 8 23 17 29 27 17 24 9 32 9 20 0 15 11 11Z" fill="currentColor" />
            <path d="m13 11 9 5-9 5z" fill="#191628" />
          </svg>
          <span>meme’d<span className="text-[#C8F36B]">.</span></span>
        </Link>

        <nav aria-label="Page navigation" className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
          <Link href="/" className="text-[#CBC5D8] transition-colors hover:text-white">← Back to Home</Link>
          <Link href="/login" className="rounded-full border border-white/25 px-4 py-2.5 transition-colors hover:border-[#A88BFA] hover:bg-white/5 sm:px-5">
            Log In ↗
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-10 sm:pt-12">
        <div className="mb-9 text-center">
          <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#CDC6DB] sm:text-xs">
            <span aria-hidden="true" className="mr-2 text-[#C8F36B]">✳</span>
            YOUR JOURNEY STARTS HERE
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            PICK YOUR <span className="text-[#A88BFA]">SIDE.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#C4BED1] sm:text-base">
            Whether you&apos;re launching campaigns or creating content, there&apos;s a place for you.
          </p>
        </div>

        <div role="group" aria-label="Choose your role" className="grid gap-5 md:grid-cols-2 md:gap-7">
          {roles.map((role, index) => {
            const isSelected = selectedRole === role.id;
            const selectedBorder = role.id === "brand" ? "border-[#C8F36B]" : "border-[#A88BFA]";
            const cardBackground = role.id === "brand" ? "bg-[#F7F5F0]" : "bg-[#EFEBF7]";

            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedRole(role.id)}
                className={`group cursor-pointer rounded-3xl border-2 p-2 text-left text-[#191628] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#C8F36B] ${cardBackground} ${isSelected ? selectedBorder : "border-transparent"}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#D6C9E3] sm:aspect-[3/2]">
                  <Image
                    src={role.image}
                    alt={role.imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 90vw, 520px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 rounded-lg bg-[#F7F5F0]/95 px-3 py-2 text-[10px] font-bold tracking-widest">
                    0{index + 1} / {role.id.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span aria-hidden="true" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-[#191628] text-xl font-bold text-[#C8F36B]">
                      ✓
                    </span>
                  )}
                </div>

                <div className="px-4 pb-4 pt-5 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {role.title}
                    </h2>
                    <span aria-hidden="true" className="text-2xl transition-transform group-hover:translate-x-1">↗</span>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#625C70]">{role.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#191628]/10 pt-4 text-[10px] font-semibold tracking-widest">
                    <span>{role.caption}</span>
                    <span aria-hidden="true" className={`size-3.5 rounded-full border border-[#191628]/40 ${isSelected ? "bg-[#191628]" : ""}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-7 text-center">
          <p aria-live="polite" className="min-h-6 text-xs text-[#ADA5C0]">
            {selectedRole ? `${selectedRoleName} selected. You're ready to continue.` : "Two paths. One creative economy. Choose yours."}
          </p>
          <button
            type="button"
            disabled={!selectedRole}
            onClick={handleContinue}
            className="mx-auto mt-3 flex w-full max-w-xs cursor-pointer items-center justify-between rounded-full bg-[#C8F36B] px-6 py-4 text-sm font-bold text-[#191628] transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-[#D9FF8C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{selectedRole ? `Continue as ${selectedRoleName}` : "Choose your side"}</span>
            <span aria-hidden="true" className="text-xl">→</span>
          </button>
          <p className="mt-4 text-xs text-[#ADA5C0]">
            Already part of Meme’d? <Link href="/login" className="font-semibold text-white underline decoration-[#A88BFA] underline-offset-4">Log In ↗</Link>
          </p>
        </div>
      </main>

      <footer className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 border-t border-white/10 px-5 py-6 text-xs text-[#ADA5C0] sm:px-10">
        <span>© 2026 Meme’d</span>
        <span className="hidden tracking-widest sm:block">WHERE CONTENT MEETS REWARDS</span>
        <Link href="/" className="transition-colors hover:text-white">Back to Home</Link>
      </footer>
    </div>
  );
}
