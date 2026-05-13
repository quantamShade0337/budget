import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { isWorkOSConfigured } from "@/lib/workos-config";
import { WelcomeHydrator } from "./hydrator";

export const dynamic = "force-dynamic";

function computeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function WelcomePage() {
  if (!isWorkOSConfigured()) {
    redirect("/login?error=workos_not_configured");
  }

  const { user } = await withAuth({ ensureSignedIn: true });

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "Friend";

  return (
    <WelcomeHydrator
      user={{
        id: user.id,
        name: fullName,
        email: user.email ?? "",
        initials: computeInitials(fullName) || "?",
      }}
    />
  );
}
