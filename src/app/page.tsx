"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSanity } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const sanity = useSanity();

  useEffect(() => {
    if (!sanity.ready) return;
    if (sanity.data.onboarded) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [sanity.ready, sanity.data.onboarded, router]);

  return <div className="min-h-screen bg-[#fafafa]" />;
}
