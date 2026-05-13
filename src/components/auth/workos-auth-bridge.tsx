"use client";

import { useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { computeInitials, useSanity } from "@/lib/store";

export function WorkOSAuthBridge() {
  const sanity = useSanity();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (sanity.data.user?.id === user.id) return;

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    sanity.setUser({
      id: user.id,
      name: fullName,
      email: user.email,
      initials: computeInitials(fullName),
    });
  }, [loading, sanity, user]);

  return null;
}
