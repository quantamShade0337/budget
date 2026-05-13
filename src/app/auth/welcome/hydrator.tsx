"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSanity, DEFAULT_MONOGRAM } from "@/lib/store";
import { SanityLogo } from "@/components/ui/sanity-logo";

interface Props {
  user: { id: string; name: string; email: string; initials: string };
}

export function WelcomeHydrator({ user }: Props) {
  const router = useRouter();
  const sanity = useSanity();
  const handled = useRef(false);

  useEffect(() => {
    if (!sanity.ready || handled.current) return;
    handled.current = true;

    sanity.setUser({
      ...user,
      monogram: sanity.data.user?.monogram ?? DEFAULT_MONOGRAM,
    });

    router.replace(sanity.data.onboarded ? "/home" : "/onboarding");
  }, [sanity, router, user]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <SanityLogo size="md" />
        <p className="text-[13px] text-neutral-500">Signing you in…</p>
      </div>
    </div>
  );
}
