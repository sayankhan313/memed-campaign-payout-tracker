
import Image from "next/image";
import Link from "next/link";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import PayoutDemo from "./PayoutDemo";

const container =
  "mx-auto w-[calc(100%-40px)] max-w-[1180px] sm:w-[calc(100%-64px)] xl:w-[calc(100%-96px)]";

const heading =
  "font-['Space_Grotesk',sans-serif] font-semibold tracking-[-0.055em]";

const eyebrow = "text-[10px] font-bold tracking-[0.18em]";

const limeButton =
  "inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-[#C8F36B] px-6 py-3 text-sm font-bold text-[#191628] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D9FF8D]";

const outlineButton =
  "inline-flex min-h-12 items-center justify-center gap-4 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A88BFA] hover:bg-white/5";

function CampaignPreview() {
  const milestones = [
    { label: "10K views", money: "₹500", done: true },
    { label: "50K views", money: "₹1,500", done: true },
    { label: "100K views", money: "₹3,000", done: false },
  ];

  const budget = [
    { label: "Total budget", value: "₹20,000" },
    { label: "Spent", value: "₹5,000" },
    { label: "Remaining", value: "₹15,000" },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[530px] lg:ml-auto">
      <div className="mb-3 flex items-center justify-between gap-3 text-[9px] font-semibold tracking-[0.14em] text-[#ADA6C0]">
        <span>✳ A LITTLE CONTENT. A LOT OF MOMENTUM.</span>
        <span aria-hidden="true">↗</span>
      </div>

      <div className="rounded-[22px] border border-white/15 bg-[#302B40] p-4 shadow-[0_25px_70px_#07050e80] transition-transform duration-300 hover:-translate-y-1 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold tracking-[0.15em] text-[#B7B1C4]">
            CAMPAIGN CONTROL ROOM
          </span>

          <span className="rounded-full border border-[#A88BFA]/30 bg-[#A88BFA]/15 px-2.5 py-1 text-[10px] text-[#D5C6F5]">
            Preview
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className={`${heading} text-[25px] leading-tight`}>
              Weekend Drop
            </h2>
            <p className="mt-1 text-[11px] text-[#B2AABF]">
              Creative energy, on repeat.
            </p>
          </div>

          <div className="flex gap-2 text-lg" aria-label="Instagram and YouTube">
            <span>◎</span>
            <span>▶</span>
          </div>
        </div>

        <div className="mt-4 grid h-[190px] grid-cols-[0.9fr_1.1fr] gap-3 sm:h-[210px] xl:h-[220px]">
          <div className="flex min-w-0 items-center justify-center overflow-hidden rounded-xl bg-[#C8F36B]">
            <Image
              src="/images/weekend-drop.svg"
              alt="Weekend Drop campaign artwork"
              width={240}
              height={235}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-col justify-between rounded-xl bg-[#191628] p-3 sm:p-4">
            <div>
              <p className="text-[8px] font-bold tracking-[0.12em] text-[#A9A1B8]">
                TOTAL POST VIEWS
              </p>

              <strong className={`${heading} mt-1 block text-[clamp(23px,2.8vw,36px)] text-[#C8F36B]`}>
                84,250
              </strong>

              <span className="text-[10px] text-[#A9A1B8]">
                views, making moves
              </span>
            </div>

            <svg
              viewBox="0 0 220 85"
              role="img"
              aria-label="Views growth trend"
              className="mt-2 max-h-[75px] w-full"
            >
              <path
                d="M0 75H220M0 45H220M0 15H220"
                stroke="#FFFFFF"
                strokeOpacity=".09"
              />
              <path
                d="M0 75 23 67 39 72 58 52 75 60 95 36 114 46 134 26 151 34 173 12 191 18 215 4"
                fill="none"
                stroke="#C8F36B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="215" cy="4" r="5" fill="#C8F36B" />
            </svg>

            <span className="text-[9px] text-[#A9A1B8]">
              Views trend
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-2 text-[9px] text-[#B7B1C4]">
          <span className="font-bold tracking-[0.12em]">
            THE REWARD LADDER
          </span>
          <span>Highest milestone wins</span>
        </div>

        <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.label}
              className={`flex items-center justify-between gap-2 px-3 py-2 text-[11px] ${
                index > 0 ? "border-t border-white/10" : ""
              } ${index === 1 ? "bg-[#A88BFA]/15" : ""}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`grid size-6 place-items-center rounded-full ${
                    milestone.done
                      ? "bg-[#C8F36B] text-[#191628]"
                      : "border border-white/20 text-[#C7C0D4]"
                  }`}
                >
                  {milestone.done ? "✓" : "3"}
                </span>
                {milestone.label}
              </span>
              <strong>{milestone.money}</strong>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between text-[10px] text-[#C5BDCD]">
          <span>Next stop: 100K views</span>
          <span>84.25%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#191628]">
          <div className="h-full w-[84.25%] rounded-full bg-[#C8F36B]" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
          {budget.map((item) => (
            <div key={item.label} className="min-w-0">
              <span className="block text-[9px] text-[#A9A1B8]">
                {item.label}
              </span>
              <strong className="mt-1 block text-[11px] sm:text-[13px]">
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#191628] py-10 text-[#F7F5F0] sm:py-12 lg:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 right-[-250px] size-[850px] rounded-full bg-[#A88BFA]/10 blur-[120px]"
      />

      <div className={`${container} relative grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12`}>
        <div className="min-w-0 max-w-[580px] lg:pt-12">
          <p className={`${eyebrow} mb-6 text-[#C8F36B]`}>
            ✳ THE CREATOR ECONOMY, REIMAGINED
          </p>

          <h1 className={`${heading} text-[clamp(52px,5.2vw,86px)] leading-[1.02]`}>
            Make every
            <br />
            <span className="relative inline-block text-[#A88BFA]">
              view
              <svg
                viewBox="0 0 240 20"
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full text-[#A88BFA]"
              >
                <path
                  d="M4 12C55 1 132 1 235 9M19 18c61-10 146-10 196-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            count<span className="text-[#C8F36B]">.</span>
          </h1>

          <p className="mt-7 max-w-[470px] text-[15px] leading-7 text-[#C5BFCE] sm:text-base">
            Launch creator campaigns. Turn milestones into rewards.
            Track momentum without losing control of your budget.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/choose-role" className={limeButton}>
              Get Started <span aria-hidden="true">↗</span>
            </Link>

            <Link href="/login" className={outlineButton}>
              Log In <span aria-hidden="true">→</span>
            </Link>
          </div>

          <p className="mt-5 text-[11px] leading-6 text-[#B2ABBF]">
            ✓ Clear milestones. Transparent rewards. Budget-aware payouts.
          </p>
        </div>

        <CampaignPreview />
      </div>

      <div className={`${container} mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-[10px] font-medium tracking-[0.13em] text-[#91899F]`}>
        <span>WHERE CONTENT MEETS REWARDS</span>

        <a href="#for-brands" className="text-[#C6C0D1] hover:text-[#C8F36B]">
          MEET YOUR NEXT CHAPTER ↓
        </a>

        <span>[ 01 — THE LAUNCHPAD ]</span>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section className="bg-[#F7F5F0] py-12 text-[#191628] sm:py-14 lg:py-10">
      <div className={container}>
        <div className="max-w-[780px]">
          <p className={eyebrow}>TWO SIDES. ONE CREATIVE ECONOMY.</p>

          <h2 className={`${heading} mt-4 text-[clamp(36px,4vw,54px)] leading-[1.05]`}>
            Built for the people
            <br />
            making things{" "}
            <span className="font-serif font-normal italic text-[#7853C4]">
              happen.
            </span>
          </h2>

          <p className="mt-4 text-[13px] leading-6 text-[#655E6F] sm:text-sm">
            Different goals. Shared momentum.
            <br />
            A better way to create, collaborate, and get rewarded.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <article
            id="for-brands"
            className="group flex min-w-0 flex-col scroll-mt-28 overflow-hidden rounded-[22px] bg-[#C8F36B] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 lg:p-7"
          >
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.15em]">
              <span>✳ FOR BRANDS</span>
              <span>01 /</span>
            </div>

            <h3 className={`${heading} mt-6 max-w-[450px] text-[clamp(26px,2.7vw,36px)] leading-[1.08]`}>
              Big ideas deserve measurable impact.
            </h3>

            <p className="mt-3 max-w-[430px] text-[13px] leading-5 text-[#383A31]">
              Build a campaign, define milestone rewards,
              and bring creators into the story. Keep every rupee in view.
            </p>

            <Link
              href="/choose-role"
              className="mt-4 inline-flex w-fit items-center gap-2 border-b border-[#191628] pb-1 text-[13px] font-bold transition-all hover:gap-4"
            >
              Get Started ↗
            </Link>

            <div className="mt-auto pt-5">
              <div className="rounded-[17px] bg-[#F7F5F0] p-4 shadow-[0_12px_25px_#19162816] transition-transform duration-300 lg:-rotate-1 group-hover:rotate-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[11px]">✳ Campaign overview</strong>
                  <span className="rounded-full bg-[#E8F8CD] px-2.5 py-1 text-[10px]">
                    Campaign snapshot
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#625C6C]">Campaign budget</span>
                  <strong className="text-[24px] leading-none sm:text-[28px]">
                    ₹20,000
                  </strong>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E2E7]">
                  <div className="h-full w-1/4 rounded-full bg-[#A88BFA]" />
                </div>

                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] text-[#6D6572]">
                  <span>Weekend Drop</span>
                  <span>25% budget used</span>
                </div>
              </div>
            </div>
          </article>

          <article
            id="for-creators"
            className="group flex min-w-0 flex-col scroll-mt-28 overflow-hidden rounded-[22px] bg-[#A88BFA] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 lg:p-7"
          >
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.15em]">
              <span>✳ FOR CREATORS</span>
              <span>02 /</span>
            </div>

            <h3 className={`${heading} mt-6 max-w-[450px] text-[clamp(26px,2.7vw,36px)] leading-[1.08]`}>
              Your content. Your momentum. Your rewards.
            </h3>

            <p className="mt-3 max-w-[430px] text-[13px] leading-5 text-[#352B4C]">
              Discover opportunities, share your post links,
              and follow your views to the next milestone.
            </p>

            <Link
              href="/choose-role"
              className="mt-4 inline-flex w-fit items-center gap-2 border-b border-[#191628] pb-1 text-[13px] font-bold transition-all hover:gap-4"
            >
              Get Started ↗
            </Link>

            <div className="mt-auto pt-5">
              <div className="rounded-[17px] bg-[#F7F5F0] p-4 shadow-[0_12px_25px_#19162816] transition-transform duration-300 lg:rotate-1 group-hover:rotate-0">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-[11px]">✳ Your creative momentum</strong>
                  <span className="text-xs text-[#7853C4]">↗</span>
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="block text-xs text-[#696270]">
                      Earned milestone
                    </span>
                    <strong className="mt-1 block text-[28px] leading-none sm:text-[32px]">
                      ₹1,500 ↗
                    </strong>
                  </div>

                  <span className="text-xs text-[#7756B9]">50K views ✓</span>
                </div>

                <div className="mt-3 flex h-6 items-end gap-2" aria-hidden="true">
                  {[40, 55, 50, 70, 63, 90, 75].map((bar, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t bg-[#A88BFA]"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      kicker: "NEW CAMPAIGN",
      title: "Create the opportunity",
      description: "Brands set a platform, campaign budget, and view-based reward milestones.",
      visual: "Weekend Drop",
      detail: "Budget ₹20,000 · 3 milestones",
    },
    {
      number: "02",
      kicker: "SUBMIT YOUR CONTENT",
      title: "Make something worth sharing",
      description: "Creators discover campaigns and submit Instagram or YouTube post links.",
      visual: "instagram.com/your-post",
      detail: "Link submitted ✓",
    },
    {
      number: "03",
      kicker: "MILESTONE REACHED",
      title: "Let momentum unlock rewards",
      description: "The highest reached view milestone determines the reward, within the campaign budget.",
      visual: "50K views → ₹1,500",
      detail: "Highest milestone wins",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-[#302B40] py-20 text-[#F7F5F0] sm:py-24"
    >
      <div className={container}>
        <p className={`${eyebrow} text-[#C8F36B]`}>FROM IDEA TO IMPACT</p>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <h2 className={`${heading} text-[clamp(40px,4.7vw,62px)] leading-[1.04]`}>
            Good things come
            <br />
            in <span className="text-[#A88BFA]">three.</span>
          </h2>

          <p className="max-w-[300px] text-sm leading-7 text-[#BFB8CC]">
            A simple path from “what if” to something worth rewarding.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number}>
              <div className="mb-5 flex items-center gap-3 text-[#C8F36B]">
                <span className="grid size-10 place-items-center rounded-full border border-[#C8F36B]/35 text-xs">
                  {step.number}
                </span>
                <span className="h-px flex-1 bg-white/15" />
              </div>

              <div className="flex h-40 flex-col justify-center rounded-[18px] border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:bg-white/10">
                <span className="text-[10px] font-bold tracking-[0.13em] text-[#AAA2BE]">
                  {step.kicker}
                </span>

                <strong className={`${heading} mt-4 break-words text-[20px] text-[#F7F5F0]`}>
                  {step.visual}
                </strong>

                <span className="mt-3 text-xs text-[#C8F36B]">
                  {step.detail}
                </span>
              </div>

              <h3 className={`${heading} mt-5 text-[20px]`}>
                {step.title}
              </h3>

              <p className="mt-3 max-w-[340px] text-[13px] leading-6 text-[#BFB8CC]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyMemed() {
  const features = [
    {
      number: "01",
      title: "Milestone clarity",
      description: "Rewards are defined before content goes live. Everyone knows the targets.",
      bg: "bg-[#DFF0BF]",
      icon: "✳",
      detail: "10K → 50K → 100K",
    },
    {
      number: "02",
      title: "Budget visibility",
      description: "See what a campaign has spent and how much remains.",
      bg: "bg-[#E2D8FA]",
      icon: "◉",
      detail: "75% remaining",
    },
    {
      number: "03",
      title: "Creator-first workflow",
      description: "Discover opportunities and follow your submitted content.",
      bg: "bg-[#FAD5C9]",
      icon: "◎",
      detail: "Submit → Track → Earn",
    },
    {
      number: "04",
      title: "Built-in safeguards",
      description: "Budget limits help keep milestone rewards within the available campaign balance.",
      bg: "bg-[#302B40] text-white",
      icon: "♧",
      detail: "Budget-aware payouts",
    },
  ];

  return (
    <section
      id="why-memed"
      className="scroll-mt-20 bg-[#F7F5F0] py-14 text-[#191628] sm:py-16 lg:py-12"
    >
      <div className={container}>
        <p className={eyebrow}>LESS FRICTION. MORE CREATION.</p>

        <h2 className={`${heading} mt-4 text-[clamp(36px,4vw,54px)] leading-[1.05]`}>
          Made for momentum.
          <br />
          Designed for{" "}
          <span className="font-serif font-normal italic text-[#7951B7]">
            clarity.
          </span>
        </h2>

        <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-[#645C6C] sm:text-sm">
          Purpose-built workflows that make expectations clear
          from campaign setup to reward tracking.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:gap-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className={`${feature.bg} group flex min-h-[185px] flex-col justify-between rounded-[20px] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 lg:min-h-[190px]`}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-white/25 text-lg">
                  {feature.icon}
                </span>
                <span className="text-[10px]">{feature.number} /</span>
              </div>

              <div className="mt-3 text-right font-['Space_Grotesk',sans-serif] text-[18px] font-medium opacity-65 sm:text-xl">
                {feature.detail}
              </div>

              <div className="mt-4">
                <h3 className={`${heading} text-[20px] leading-tight`}>
                  {feature.title}
                </h3>

                <p className="mt-2 max-w-[410px] text-[12px] leading-5 opacity-75">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#191628] py-24 text-center text-[#F7F5F0] sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,139,250,0.12),transparent_70%)]"
      />

      <div className={`${container} relative`}>
        <p className={`${eyebrow} text-[#C8F36B]`}>
          YOUR NEXT BIG THING STARTS HERE
        </p>

        <h2 className={`${heading} mx-auto mt-6 max-w-[990px] text-[clamp(43px,5.5vw,72px)] leading-[1.04]`}>
          Good content moves people.
          <br />
          <span className="text-[#A88BFA]">
            Great campaigns reward it.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-[410px] text-sm leading-7 text-[#B7B0C5]">
          Pick your side and make your next campaign count.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/choose-role" className={limeButton}>
            Get Started <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/login" className={outlineButton}>
            Log In <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#191628] font-['Inter',sans-serif] text-[#F7F5F0] antialiased [scroll-behavior:smooth]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[#C8F36B] focus:p-3 focus:text-[#191628]"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Audiences />
        <HowItWorks />
        <PayoutDemo />
        <WhyMemed />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
