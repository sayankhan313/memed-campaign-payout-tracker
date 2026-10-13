
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "../../components/layout/BrandLogo";

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "brand" | "creator";
  };
};

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!visible && <path d="M4 20 20 4" />}
    </svg>
  );
}

function CampaignPreview() {
  const metrics = [
    { label: "Views", value: "84,250", detail: "↗ 18.4%" },
    { label: "Milestone", value: "50K", detail: "Achieved" },
    { label: "Eligible reward", value: "₹1,500", detail: "Unlocked" },
  ];

  return (
    <div className="mt-5 rounded-[18px] border border-white/10 bg-[#3A344B] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-[#C8F36B]">
            LIVE CAMPAIGN
          </p>
          <h2 className="mt-1 font-['Space_Grotesk',sans-serif] text-xl font-semibold">
            Weekend Drop
          </h2>
        </div>

        <div className="flex gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#191628] text-sm" aria-label="Instagram">
            ◎
          </span>
          <span className="grid size-8 place-items-center rounded-lg bg-[#191628] text-sm text-[#FFAB95]" aria-label="YouTube">
            ▶
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 border-y border-white/10">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`min-w-0 py-3 ${
              index === 1
                ? "border-x border-white/10 px-3"
                : index === 2
                  ? "pl-3"
                  : "pr-3"
            }`}
          >
            <p className="text-[9px] text-[#BFB8CB]">
              {metric.label}
            </p>

            <strong className="mt-1 block font-['Space_Grotesk',sans-serif] text-[20px] font-semibold tracking-[-0.04em]">
              {metric.value}
            </strong>

            <span className="mt-1 block text-[9px] font-semibold text-[#C8F36B]">
              {metric.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-[9px] text-[#BFB8CB]">
        <span>Campaign momentum</span>
        <span>Last 7 days</span>
      </div>

      <svg
        viewBox="0 0 500 100"
        role="img"
        aria-label="Illustrative campaign view growth"
        className="mt-2 h-[55px] w-full"
      >
        <defs>
          <linearGradient id="login-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8F36B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8F36B" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M0 25H500M0 55H500M0 85H500"
          stroke="white"
          strokeOpacity="0.08"
        />

        <path
          d="M0 90 C40 90 48 91 75 83 S125 69 155 64 S193 45 230 50 S275 54 315 33 S363 36 393 25 S443 22 500 7 L500 100 H0Z"
          fill="url(#login-chart-fill)"
        />

        <path
          d="M0 90 C40 90 48 91 75 83 S125 69 155 64 S193 45 230 50 S275 54 315 33 S363 36 393 25 S443 22 500 7"
          fill="none"
          stroke="#C8F36B"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="500" cy="7" r="5" fill="#C8F36B" />
      </svg>

      <div className="mt-2 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[84.25%] rounded-full bg-gradient-to-r from-[#A88BFA] to-[#C8F36B]" />
        </div>

        <span className="text-[10px] font-bold text-[#C8F36B]">
          84%
        </span>
      </div>
    </div>
  );
}

function LoginStory() {
  return (
    <aside className="relative hidden flex-col overflow-hidden bg-[#191628] px-8 py-7 text-[#F7F5F0] lg:flex xl:px-10 xl:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(168,139,250,0.15),transparent_55%)]"
      />

      <div className="relative flex items-center justify-between gap-4">
        <BrandLogo />

        <Link href="/" className="text-[11px] text-[#C3BDCC] transition-colors hover:text-[#C8F36B]">
          Back to Home ↗
        </Link>
      </div>

      <div className="relative my-6 flex flex-1 flex-col justify-center">
        <p className="text-[9px] font-bold tracking-[0.15em] text-[#C8F36B]">
          YOUR MOMENTUM, CONTINUED
        </p>

        <h1 className="mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(37px,3.4vw,48px)] leading-[1.04] font-semibold tracking-[-0.055em]">
          Welcome back
          <br />
          to the{" "}
          <span className="text-[#A88BFA]">
            momentum.
          </span>
        </h1>

        <p className="mt-4 max-w-[450px] text-[13px] leading-6 text-[#C3BDCD]">
          Your campaigns, your content, your next milestone — all in one place.
        </p>

        <CampaignPreview />
      </div>

      <p className="relative border-t border-white/10 pt-3 text-[9px] font-medium tracking-[0.12em] text-[#9990AC]">
        WHERE CONTENT MEETS REWARDS.
      </p>
    </aside>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    setFormError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!cleanEmail) {
      setEmailError("Please enter your email address.");
      hasError = true;
    } else if (!validEmail) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.message || "Invalid email or password.");
      }

      if (result.user.role === "brand") {
        router.replace("/brand/dashboard");
        return;
      }

      if (result.user.role === "creator") {
        router.replace("/creator/dashboard");
        return;
      }

      throw new Error("Your account role is not supported.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh bg-[#E9EDF5] px-3 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto my-auto w-full max-w-[1160px] overflow-hidden rounded-[26px] bg-[#F7F5F0] shadow-[0_25px_70px_rgba(25,22,40,0.14)] ring-1 ring-black/5 lg:grid lg:grid-cols-[52%_48%]">
        <LoginStory />

        <main className="flex flex-col bg-[#F7F5F0] text-[#191628]">
          {/* Mobile header */}
          <div className="flex items-center justify-between gap-3 bg-[#191628] px-5 py-4 text-white lg:hidden">
            <BrandLogo />

            <Link href="/" className="text-[11px] text-[#C3BDCC]">
              Back to Home ↗
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-9 sm:px-10 lg:px-11 lg:py-8">
            <div className="w-full max-w-[410px]">
              <p className="text-[9px] font-bold tracking-[0.15em] text-[#7856BE]">
                WELCOME BACK / MEME’D
              </p>

              <h2 className="mt-3 font-['Space_Grotesk',sans-serif] text-[clamp(32px,3vw,40px)] leading-[1.07] font-semibold tracking-[-0.05em]">
                Good to have you
                <br />
                back.
              </h2>

              <p className="mt-3 text-[13px] text-[#77717F]">
                Sign in to keep things moving.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-7">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-[12px] font-semibold">
                    Email Address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                      setFormError("");
                    }}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "login-email-error" : undefined}
                    disabled={loading}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-[13px] text-[#191628] outline-none transition-colors placeholder:text-[#9892A0] focus:ring-2 focus:ring-[#A88BFA]/25 disabled:opacity-60 ${
                      emailError
                        ? "border-red-400"
                        : "border-[#DDD8E2] focus:border-[#A88BFA]"
                    }`}
                  />

                  {emailError && (
                    <p id="login-email-error" className="mt-1.5 text-[11px] text-red-600">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mt-4">
                  <label htmlFor="login-password" className="mb-2 block text-[12px] font-semibold">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setPasswordError("");
                        setFormError("");
                      }}
                      placeholder="Enter your password"
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      disabled={loading}
                      className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-[13px] text-[#191628] outline-none transition-colors placeholder:text-[#9892A0] focus:ring-2 focus:ring-[#A88BFA]/25 disabled:opacity-60 ${
                        passwordError
                          ? "border-red-400"
                          : "border-[#DDD8E2] focus:border-[#A88BFA]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#81798B] hover:text-[#191628] focus-visible:outline-2 focus-visible:outline-[#7856BE]"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>

                  {passwordError && (
                    <p id="login-password-error" className="mt-1.5 text-[11px] text-red-600">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Login error */}
                {formError && (
                  <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
                    {formError}
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#C8F36B] px-5 text-[14px] font-bold text-[#191628] transition-all hover:bg-[#D9FF8D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7856BE] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-[#191628]/25 border-t-[#191628]" aria-hidden="true" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Log In <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>

                <div className="mt-5 border-t border-[#E2DDE5] pt-5 text-center">
                  <p className="text-[12px] text-[#77717F]">
                    New around here?{" "}
                    <Link href="/choose-role" className="font-bold text-[#7856BE] hover:underline">
                      Get Started ↗
                    </Link>
                  </p>

                  <Link href="/" className="mt-3 inline-block text-[11px] text-[#77717F]  hover:text-[#191628]">
                    Return Home
                  </Link>
                </div>
              </form>

              <p className="mt-5 text-center text-[10px] text-[#918A97]">
                © 2026 Meme’d. Secure access for brands and creators.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
