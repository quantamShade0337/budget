"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useSanity } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sanity = useSanity();

  useEffect(() => {
    if (sanity.ready && !sanity.data.onboarded) {
      router.replace("/onboarding");
    }
  }, [sanity.ready, sanity.data.onboarded, router]);

  if (!sanity.ready) {
    return <div className="h-screen bg-white" />;
  }

  if (!sanity.data.onboarded) {
    return <div className="h-screen bg-white" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar user={sanity.data.user} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
