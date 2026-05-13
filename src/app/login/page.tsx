"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { SanityLogo } from "@/components/ui/sanity-logo";
import { useSanity, computeInitials } from "@/lib/store";

const WORKOS_ENABLED = Boolean(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI);

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const sanity = useSanity();
  const [email, setEmail] = useState("");
  const errorParam = search.get("error");
  const [showEmailFallback, setShowEmailFallback] = useState(!WORKOS_ENABLED);

  const error =
    errorParam === "workos_not_configured"
      ? "WorkOS is not configured on this build. Use email to continue locally."
      : null;

  useEffect(() => {
    if (sanity.ready && sanity.data.onboarded && !errorParam) {
      router.replace("/home");
    }
  }, [sanity.ready, sanity.data.onboarded, errorParam, router]);

  const continueWithEmail = () => {
    if (!email.trim()) return;
    if (!sanity.data.user) {
      sanity.setUser({
        id: "user_local",
        name: email.split("@")[0],
        email: email.trim(),
        initials: computeInitials(email.split("@")[0]),
      });
    }
    router.push("/onboarding");
  };

  if (!sanity.ready) return <div className="min-h-screen bg-[#fafafa]" />;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="px-6 py-5 max-w-md mx-auto w-full">
        <SanityLogo size="sm" />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 -mt-12">
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2 text-center">
            Welcome to Sanity
          </h1>
          <p className="text-sm text-neutral-500 text-center mb-10">
            All your money, in one quiet place.
          </p>

          <div className="bg-white border border-neutral-200/70 rounded-2xl p-7">
            {error && (
              <div className="mb-5 flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Primary: WorkOS */}
            <a
              href="/auth/workos/sign-in"
              className="w-full h-11 flex items-center justify-center gap-1.5 bg-neutral-900 text-white rounded-full text-[14px] font-medium hover:bg-neutral-800 transition-all group active:scale-[0.98]"
              onClick={(e) => {
                if (!WORKOS_ENABLED) {
                  e.preventDefault();
                  setShowEmailFallback(true);
                }
              }}
            >
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              Continue with WorkOS
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>

            <p className="text-center text-[11px] text-neutral-400 mt-2">
              Single sign-on via Google, Microsoft, Okta, and more.
            </p>

            {/* Email fallback */}
            {!showEmailFallback ? (
              <button
                onClick={() => setShowEmailFallback(true)}
                className="block mx-auto mt-5 text-[12px] text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                Use email instead
              </button>
            ) : (
              <div className="mt-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-neutral-100" />
                  <span className="text-[11px] text-neutral-400">or continue with email</span>
                  <div className="flex-1 h-px bg-neutral-100" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === "Enter" && continueWithEmail()}
                  className="w-full h-11 px-4 border border-neutral-200 rounded-full text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 transition-all mb-2"
                />
                <button
                  onClick={continueWithEmail}
                  disabled={!email.trim()}
                  className="w-full h-10 border border-neutral-200 text-neutral-700 rounded-full text-[13px] font-medium hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  Continue locally
                </button>
                <p className="text-center text-[11px] text-neutral-400 mt-2 leading-relaxed">
                  Your data stays only on this device.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-neutral-400 mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-neutral-700 transition-colors">
              Terms
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-neutral-700 transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <LoginInner />
    </Suspense>
  );
}
