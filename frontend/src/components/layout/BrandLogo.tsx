import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link
      href="/"
      aria-label="Meme’d home"
      className="inline-flex shrink-0 items-center gap-2 text-[29px] font-bold tracking-[-0.08em] text-[#F7F5F0]"
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
    >
      <svg viewBox="0 0 32 32" className="size-8 text-[#C8F36B]" aria-hidden="true">
        <path
          d="M15 1 19 11 30 8 23 17 29 27 17 24 9 32 9 20 0 15 11 11Z"
          fill="currentColor"
        />
        <path d="m13 11 9 5-9 5z" fill="#191628" />
      </svg>

      <span>
        meme’d<span className="text-[#C8F36B]">.</span>
      </span>
    </Link>
  );
}