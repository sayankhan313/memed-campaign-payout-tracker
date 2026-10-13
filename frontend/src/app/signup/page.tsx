
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "../../components/layout/BrandLogo";

type Role = "brand" | "creator";

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type SignupResponse = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  errors?: { field: string; message: string }[];
};

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!visible && <path d="M4 20 20 4" />}
    </svg>
  );
}

function CampaignPreview({ role }: { role: Role }) {
  const isBrand = role === "brand";

  const metrics = isBrand
    ? [
        { label: "Budget", value: "₹20,000", detail: "Campaign total" },
        { label: "Milestones", value: "3", detail: "Reward targets" },
        { label: "Remaining", value: "₹15,000", detail: "Available" },
      ]
    : [
        { label: "Post views", value: "84,250", detail: "↗ Growing" },
        { label: "Milestone", value: "50K", detail: "Achieved" },
        { label: "Reward", value: "₹1,500", detail: "Eligible" },
      ];

  return (
    <div className="mt-5 rounded-[18px] border border-white/10 bg-[#3A344B] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[9px] font-bold tracking-[0.13em] ${
              isBrand ? "text-[#C8F36B]" : "text-[#C7B3FF]"
            }`}
          >
            {isBrand ? "CAMPAIGN OVERVIEW" : "CREATOR MOMENTUM"}
          </p>

          <h2 className="mt-1 font-['Space_Grotesk',sans-serif] text-xl font-semibold">
            {isBrand ? "Weekend Drop" : "Your content in motion"}
          </h2>
        </div>

        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#191628] text-[#C8F36B]">
          ✳
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 border-y border-white/10">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`min-w-0 py-3 ${
              index === 1
                ? "border-x border-white/10 px-2.5"
                : index === 2
                  ? "pl-2.5"
                  : "pr-2.5"
            }`}
          >
            <p className="text-[9px] text-[#BFB8CB]">
              {metric.label}
            </p>

            <strong className="mt-1 block font-['Space_Grotesk',sans-serif] text-[clamp(14px,1.55vw,20px)] font-semibold tracking-[-0.04em]">
              {metric.value}
            </strong>

            <span
              className={`mt-1 block text-[9px] font-medium ${
                isBrand ? "text-[#C8F36B]" : "text-[#C7B3FF]"
              }`}
            >
              {metric.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between gap-3 text-[9px] text-[#BFB8CB]">
        <span>{isBrand ? "Campaign milestones" : "Content momentum"}</span>
        <span>{isBrand ? "Views → Rewards" : "Last 7 days"}</span>
      </div>

      {isBrand ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { views: "10K", reward: "₹500" },
            { views: "50K", reward: "₹1,500" },
            { views: "100K", reward: "₹3,000" },
          ].map((item) => (
            <div
              key={item.views}
              className="rounded-lg border border-white/10 bg-[#191628]/65 px-2 py-3 text-center"
            >
              <strong className="block text-[15px] text-[#C8F36B]">
                {item.views}
              </strong>

              <span className="mt-1 block text-[10px] text-[#D1CADB]">
                {item.reward}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <svg
          viewBox="0 0 500 100"
          role="img"
          aria-label="Illustrative content views growth"
          className="mt-3 h-[65px] w-full"
        >
          <defs>
            <linearGradient id="signup-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A88BFA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#A88BFA" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M0 25H500M0 55H500M0 85H500"
            stroke="white"
            strokeOpacity="0.08"
          />

          <path
            d="M0 90 C40 90 48 91 75 83 S125 69 155 64 S193 45 230 50 S275 54 315 33 S363 36 393 25 S443 22 500 7 L500 100 H0Z"
            fill="url(#signup-chart-fill)"
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
      )}

      <p className="mt-3 text-[10px] leading-4 text-[#BFB8CB]">
        {isBrand
          ? "Set clear targets and keep every reward within your campaign budget."
          : "Share your post links, follow your views and see which rewards you have unlocked."}
      </p>
    </div>
  );
}

function SignupStory({ role }: { role: Role }) {
  const isBrand = role === "brand";

  return (
    <aside className="relative hidden flex-col overflow-hidden bg-[#191628] px-8 py-7 text-[#F7F5F0] lg:flex xl:px-10 xl:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(168,139,250,0.15),transparent_55%)]"
      />

      <div className="relative flex items-center justify-between gap-4">
        <BrandLogo />

        <Link
          href="/"
          className="text-[11px] text-[#C3BDCC] transition-colors hover:text-[#C8F36B]"
        >
          Back to Home ↗
        </Link>
      </div>

      <div className="relative my-5 flex flex-1 flex-col justify-center">
        <p
          className={`text-[9px] font-bold tracking-[0.15em] ${
            isBrand ? "text-[#C8F36B]" : "text-[#A88BFA]"
          }`}
        >
          {isBrand ? "YOUR NEXT CAMPAIGN STARTS HERE" : "YOUR CREATIVITY, YOUR NEXT CHAPTER"}
        </p>

        <h1 className="mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(36px,3.35vw,48px)] leading-[1.04] font-semibold tracking-[-0.055em]">
          {isBrand ? (
            <>
              Big ideas.
              <br />
              Real{" "}
              <span className="text-[#C8F36B]">
                momentum.
              </span>
            </>
          ) : (
            <>
              Your content.
              <br />
              Your{" "}
              <span className="text-[#A88BFA]">
                momentum.
              </span>
            </>
          )}
        </h1>

        <p className="mt-4 max-w-[440px] text-[13px] leading-6 text-[#C3BDCD]">
          {isBrand
            ? "Create campaigns, define milestones and discover the power of creator-led momentum."
            : "Discover campaigns, share your creativity and track the milestones your content reaches."}
        </p>

        <CampaignPreview role={role} />
      </div>

      <p className="relative border-t border-white/10 pt-3 text-[9px] font-medium tracking-[0.12em] text-[#9990AC]">
        WHERE CONTENT MEETS REWARDS.
      </p>
    </aside>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role");
  const role: Role | null =
    selectedRole === "brand" || selectedRole === "creator"
      ? selectedRole
      : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role || loading) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const nextErrors: SignupErrors = {};

    if (cleanName.length < 2 || cleanName.length > 80) {
      nextErrors.name = "Name must be between 2 and 80 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const strongPassword =
      password.length >= 8 &&
      password.length <= 128 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9\s]/.test(password);

    if (!strongPassword) {
      nextErrors.password =
        "Use 8–128 characters with uppercase, lowercase, number and symbol.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    } else if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    }

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          role,
        }),
      });

      const result = (await response.json()) as SignupResponse;

      if (!response.ok || !result.success || !result.user) {
        if (result.errors?.length) {
          const serverErrors: SignupErrors = {};

          for (const error of result.errors) {
            if (
              error.field === "name" ||
              error.field === "email" ||
              error.field === "password"
            ) {
              serverErrors[error.field] = error.message;
            }
          }

          setErrors(serverErrors);
        }

        throw new Error(
          result.message || "Unable to create your account."
        );
      }

      router.replace(
        result.user.role === "brand"
          ? "/brand/dashboard"
          : "/creator/dashboard"
      );
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  if (!role) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#E9EDF5] px-5">
        <div className="w-full max-w-[440px] rounded-[24px] bg-[#F7F5F0] p-8 text-center shadow-[0_25px_70px_rgba(25,22,40,0.12)]">
          <span className="text-3xl text-[#7856BE]">✳</span>

          <h1 className="mt-4 font-['Space_Grotesk',sans-serif] text-3xl font-semibold text-[#191628]">
            Pick your side first.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#77717F]">
            Join Meme’d as a Brand or Creator to get started.
          </p>

          <Link
            href="/choose-role"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#C8F36B] px-6 text-sm font-bold text-[#191628]"
          >
            Choose Your Role ↗
          </Link>
        </div>
      </main>
    );
  }

  const isBrand = role === "brand";
  const accent = isBrand ? "bg-[#C8F36B]" : "bg-[#A88BFA]";

  const inputClass =
    "h-11 w-full rounded-xl border border-[#DDD8E2] bg-white px-4 text-[13px] text-[#191628] outline-none transition-colors placeholder:text-[#9892A0] focus:border-[#A88BFA] focus:ring-2 focus:ring-[#A88BFA]/25 disabled:opacity-60";

  return (
    <div className="flex min-h-dvh bg-[#E9EDF5] px-3 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto my-auto w-full max-w-[1160px] overflow-hidden rounded-[26px] bg-[#F7F5F0] shadow-[0_25px_70px_rgba(25,22,40,0.14)] ring-1 ring-black/5 lg:grid lg:grid-cols-[52%_48%]">
        <SignupStory role={role} />

        <main className="flex flex-col bg-[#F7F5F0] text-[#191628]">
          {/* Mobile header */}
          <div className="flex items-center justify-between gap-3 bg-[#191628] px-5 py-4 text-white lg:hidden">
            <BrandLogo />

            <Link href="/" className="text-[11px] text-[#C3BDCC]">
              Back to Home ↗
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-7 sm:px-10 lg:px-11">
            <div className="w-full max-w-[410px]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] font-bold tracking-[0.15em] text-[#7856BE]">
                  STEP 02 / CREATE ACCOUNT
                </p>

                <Link
                  href="/choose-role"
                  className="text-[11px] font-medium text-[#7856BE] hover:underline"
                >
                  Change role ↗
                </Link>
              </div>

              <span
                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  isBrand
                    ? "bg-[#E4F5C3] text-[#3B4A1F]"
                    : "bg-[#E8DEFC] text-[#5C4095]"
                }`}
              >
                ✳ Joining as a {isBrand ? "Brand" : "Creator"}
              </span>

              <h2 className="mt-3 font-['Space_Grotesk',sans-serif] text-[clamp(30px,3vw,39px)] leading-[1.07] font-semibold tracking-[-0.05em]">
                Let&apos;s make it official.
              </h2>

              <p className="mt-2 text-[12px] leading-5 text-[#77717F]">
                Just a few details and you&apos;re ready to get started.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-5">
                
                <div>
                  <label htmlFor="signup-name" className="mb-1.5 block text-[12px] font-semibold">
                    Full Name
                  </label>

                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrors((previous) => ({ ...previous, name: undefined }));
                      setFormError("");
                    }}
                    placeholder="Your full name"
                    disabled={loading}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "signup-name-error" : undefined}
                    className={`${inputClass} ${errors.name ? "!border-red-400" : ""}`}
                  />

                  {errors.name && (
                    <p id="signup-name-error" className="mt-1 text-[11px] text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <label htmlFor="signup-email" className="mb-1.5 block text-[12px] font-semibold">
                    Email Address
                  </label>

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((previous) => ({ ...previous, email: undefined }));
                      setFormError("");
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                    className={`${inputClass} ${errors.email ? "!border-red-400" : ""}`}
                  />

                  {errors.email && (
                    <p id="signup-email-error" className="mt-1 text-[11px] text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mt-3">
                  <label htmlFor="signup-password" className="mb-1.5 block text-[12px] font-semibold">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((previous) => ({ ...previous, password: undefined }));
                        setFormError("");
                      }}
                      placeholder="Create a password"
                      disabled={loading}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "signup-password-error" : "password-help"}
                      className={`${inputClass} pr-12 ${errors.password ? "!border-red-400" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#81798B] hover:text-[#191628]"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>

                  <p id="password-help" className="mt-1 text-[10px] leading-4 text-[#77717F]">
                    8+ characters, uppercase, lowercase, number and symbol.
                  </p>

                  {errors.password && (
                    <p id="signup-password-error" className="mt-1 text-[11px] text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="mt-3">
                  <label htmlFor="signup-confirm-password" className="mb-1.5 block text-[12px] font-semibold">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setErrors((previous) => ({ ...previous, confirmPassword: undefined }));
                        setFormError("");
                      }}
                      placeholder="Confirm your password"
                      disabled={loading}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword ? "signup-confirm-error" : undefined
                      }
                      className={`${inputClass} pr-12 ${errors.confirmPassword ? "!border-red-400" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((previous) => !previous)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#81798B] hover:text-[#191628]"
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p id="signup-confirm-error" className="mt-1 text-[11px] text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {formError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700"
                  >
                    {formError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl px-5 text-[14px] font-bold text-[#191628] transition-all hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7856BE] disabled:cursor-not-allowed disabled:opacity-70 ${accent}`}
                >
                  {loading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-[#191628]/25 border-t-[#191628]"
                      />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>

                <div className="mt-4 border-t border-[#E2DDE5] pt-4 text-center">
                  <p className="text-[12px] text-[#77717F]">
                    Already part of Meme&apos;d?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-[#7856BE] hover:underline"
                    >
                      Log In ↗
                    </Link>
                  </p>
                </div>
              </form>

              <p className="mt-4 text-center text-[10px] text-[#918A97]">
                © 2026 Meme’d. Made for brands and creators.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#E9EDF5] text-sm text-[#191628]">
          Loading signup...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
