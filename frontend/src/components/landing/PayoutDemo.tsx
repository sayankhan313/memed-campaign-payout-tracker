
"use client";

import { useState } from "react";

const milestones = [
  { views: 10000, payout: 500, label: "10K" },
  { views: 50000, payout: 1500, label: "50K" },
  { views: 100000, payout: 3000, label: "100K" },
] as const;

const totalBudget = 20000;
const alreadySpent = 5000;

function formatMoney(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PayoutDemo() {
  const [views, setViews] = useState(84250);

  const reached = milestones.filter(
    (milestone) => views >= milestone.views
  );

  const current = reached[reached.length - 1];

  const next = milestones.find(
    (milestone) => views < milestone.views
  );

  const payout = current?.payout ?? 0;
  const remainingBudget = totalBudget - alreadySpent - payout;

  return (
    <section
      id="payout-demo"
      className="scroll-mt-20 bg-[#C8F36B] py-12 text-[#191628] sm:py-14 lg:py-12 xl:py-14"
    >
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1180px] items-center gap-9 sm:w-[calc(100%-64px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12 xl:gap-14">

        {/* Left: Section information */}
        <div className="min-w-0">
          <p className="mb-4 text-[10px] font-bold tracking-[0.17em]">
            ✳ THE MATH BEHIND THE MAGIC
          </p>

          <h2 className="font-['Space_Grotesk',sans-serif] text-[clamp(38px,4.2vw,64px)] leading-[1.04] font-semibold tracking-[-0.06em]">
            <span className="block lg:whitespace-nowrap">
              No guesswork.
            </span>

            <span className="block">
              Just{" "}
              <span className="text-[#7856BE] underline decoration-2 underline-offset-4">
                milestones.
              </span>
            </span>
          </h2>

          <p className="mt-5 max-w-[400px] text-[14px] leading-6 text-[#413D46]">
            See how views translate into rewards — and how
            campaign budgets stay in control.
          </p>

          <div className="mt-7 space-y-4 border-t border-[#191628]/20 pt-5">
            <div className="flex gap-3">
              <span className="shrink-0 text-sm font-bold text-[#7754B8]">
                01
              </span>

              <p className="text-[13px] leading-5">
                <strong>Highest milestone wins.</strong>
                <br />
                Cross 50K views? Earn ₹1,500 — not the sum of earlier rewards.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="shrink-0 text-sm font-bold text-[#7754B8]">
                02
              </span>

              <p className="text-[13px] leading-5">
                <strong>Budget has boundaries.</strong>
                <br />
                Rewards must fit within the remaining campaign balance.
              </p>
            </div>
          </div>

          <p className="mt-7 font-['Space_Grotesk',sans-serif] text-base font-semibold">
            Try moving the slider ↗
          </p>
        </div>

        {/* Right: Interactive payout calculator */}
        <div className="min-w-0 rounded-[22px] bg-[#F7F5F0] p-5 shadow-[0_20px_55px_#19162820] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-[0.13em]">
              THE MILESTONE PLAYGROUND
            </span>

            <span className="rounded-full bg-[#E9E2F7] px-3 py-1.5 text-[10px] font-medium text-[#7253BD]">
              Interactive
            </span>
          </div>

          {/* Views */}
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <label
                htmlFor="views-slider"
                className="text-xs text-[#625C6C]"
              >
                Post views
              </label>

              <output
                htmlFor="views-slider"
                className="mt-1 block font-['Space_Grotesk',sans-serif] text-[38px] leading-none font-semibold tracking-[-0.05em] sm:text-[44px]"
              >
                {views.toLocaleString("en-IN")}
              </output>
            </div>

            <span className="text-right text-[11px] text-[#625C6C]">
              Slide to explore ↗
            </span>
          </div>

          {/* Slider */}
          <input
            id="views-slider"
            type="range"
            min={0}
            max={120000}
            step={250}
            value={views}
            onChange={(event) => setViews(Number(event.target.value))}
            aria-valuetext={`${views.toLocaleString("en-IN")} views, ${formatMoney(payout)} reward`}
            className="mt-5 h-2 w-full cursor-pointer accent-[#7856BE]"
          />

          <div className="mt-1 flex justify-between text-[10px] text-[#88818D]">
            <span>0 views</span>
            <span>120K views</span>
          </div>

          {/* Milestone cards */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {milestones.map((milestone) => {
              const isCurrent = current?.views === milestone.views;
              const isReached = views >= milestone.views;

              return (
                <button
                  key={milestone.views}
                  type="button"
                  onClick={() => setViews(milestone.views)}
                  aria-pressed={isCurrent}
                  className={`min-w-0 rounded-xl border p-3 text-left transition-colors hover:border-[#A88BFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7856BE] ${
                    isCurrent
                      ? "border-[#A88BFA] bg-[#EEE7FB]"
                      : "border-[#E5E1E8] bg-white"
                  }`}
                >
                  <span
                    className={`mb-2 grid size-6 place-items-center rounded-full text-xs ${
                      isReached
                        ? "bg-[#C8F36B]"
                        : "bg-[#EAE7EC]"
                    }`}
                  >
                    {isReached ? "✓" : "○"}
                  </span>

                  <strong className="block font-['Space_Grotesk',sans-serif] text-xl font-semibold sm:text-2xl">
                    {milestone.label}
                  </strong>

                  <span className="block text-[11px] text-[#625C6C]">
                    {formatMoney(milestone.payout)}
                  </span>

                  <span className="mt-2 block text-[10px] leading-4 font-medium text-[#7253BD]">
                    {isCurrent
                      ? "Current reward"
                      : isReached
                        ? "Reached"
                        : "Not reached"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next milestone information */}
          <p
            aria-live="polite"
            className="mt-3 min-h-5 text-[11px] leading-5 text-[#625C6C]"
          >
            {next
              ? `${(next.views - views).toLocaleString("en-IN")} more views to the ${formatMoney(next.payout)} milestone`
              : "Top milestone reached!"}
          </p>

          {/* Current payout summary */}
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-[#191628] p-4 text-[#F7F5F0]">
            <div className="min-w-0">
              <span className="block text-[10px] leading-4 text-[#BFB8CB]">
                Current eligible reward
              </span>

              <strong className="mt-1 block font-['Space_Grotesk',sans-serif] text-[22px] font-semibold text-[#C8F36B] sm:text-[26px]">
                {formatMoney(payout)}
              </strong>
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] leading-4 text-[#BFB8CB]">
                Remaining budget
              </span>

              <strong className="mt-1 block font-['Space_Grotesk',sans-serif] text-[22px] font-semibold sm:text-[26px]">
                {formatMoney(remainingBudget)}
              </strong>
            </div>
          </div>

          {/* Budget progress */}
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap justify-between gap-2 text-[11px]">
              <strong>Campaign budget</strong>
              <span>₹20,000 total</span>
            </div>

            <div className="flex h-2 overflow-hidden rounded-full bg-[#E4DFE7]">
              <span className="w-1/4 bg-[#A88BFA]" />

              <span
                className="bg-[#191628] transition-[width] duration-200"
                style={{
                  width: `${(payout / totalBudget) * 100}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[10px] leading-4 text-[#625C6C]">
              Already spent ₹5,000 · This eligible reward {formatMoney(payout)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
