"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SanityLogo } from "@/components/ui/sanity-logo";
import { useSanity, computeInitials } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const sanity = useSanity();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (sanity.ready && sanity.data.onboarded) {
      router.replace("/home");
    }
  }, [sanity.ready, sanity.data.onboarded, router]);

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

  const continueWithGoogle = () => {
    router.push("/onboarding");
  };

  if (!sanity.ready) return <div className="min-h-screen bg-[#fafafa]" />;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="px-6 py-5 max-w-md mx-auto w-full">
        <SanityLogo size="sm" />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 -mt-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2 text-center">
            Welcome to Sanity
          </h1>
          <p className="text-sm text-neutral-500 text-center mb-10">
            All your money, in one quiet place.
          </p>

          <div className="bg-white border border-neutral-200/70 rounded-2xl p-7">
            <button
              onClick={continueWithGoogle}
              className="w-full h-11 flex items-center justify-center gap-2.5 border border-neutral-200 rounded-full text-[14px] font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-neutral-100" />
              <span className="text-[11px] text-neutral-400">or</span>
              <div className="flex-1 h-px bg-neutral-100" />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === "Enter" && continueWithEmail()}
              className="w-full h-11 px-4 border border-neutral-200 rounded-full text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 transition-all mb-3"
            />

            <button
              onClick={continueWithEmail}
              disabled={!email.trim()}
              className="w-full h-11 bg-neutral-900 text-white rounded-full text-[14px] font-medium hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 group"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0" />
            </button>
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

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M17.64 9.2a10.34 10.34 0 0 0-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
