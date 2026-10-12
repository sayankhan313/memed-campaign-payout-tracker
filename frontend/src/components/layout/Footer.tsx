import Link from "next/link";
import BrandLogo from "./BrandLogo";

type FooterProps = {
  minimal?: boolean;
};

const container =
  "mx-auto w-[calc(100%-40px)] max-w-[1180px] sm:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]";

export default function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer className="bg-[#131020] py-6 text-xs text-[#ADA5C0]">
        <div className={`${container} flex flex-wrap items-center justify-between gap-4`}>
          <span>© 2026 Meme’d</span>

          <nav className="flex gap-5">
            <Link href="/" className="hover:text-white">
              Back to Home
            </Link>
            <Link href="/login" className="hover:text-white">
              Log In
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#131020] py-12 text-[#D7D1E0]">
      <div className={`${container} flex flex-wrap items-start justify-between gap-8`}>
        <div>
          <BrandLogo />

          <p className="mt-4 text-xs leading-6 text-[#9890A9]">
            Where content meets rewards.
            <br />
            Made for the next wave of creativity.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
          <Link href="/#for-brands" className="hover:text-[#C8F36B]">
            For Brands
          </Link>
          <Link href="/#for-creators" className="hover:text-[#C8F36B]">
            For Creators
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#C8F36B]">
            How It Works
          </Link>
          <Link href="/login" className="hover:text-[#C8F36B]">
            Log In
          </Link>
        </nav>

        <a
          href="https://github.com/sayankhan313/memed-campaign-payout-tracker"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/15 px-5 py-3 text-xs hover:border-[#C8F36B]"
        >
          GitHub ↗
        </a>
      </div>

      <div className={`${container} mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[10px] text-[#8F869F]`}>
        <span>© 2026 Meme’d. All creative energy welcome.</span>
        <span>THE LAUNCHPAD · WHERE IT ALL BEGINS</span>
      </div>
    </footer>
  );
}