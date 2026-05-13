import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { isWorkOSConfigured } from "@/lib/workos-config";

export async function GET() {
  if (!isWorkOSConfigured()) {
    redirect("/login?error=workos_not_configured");
  }

  const signInUrl = await getSignInUrl({
    state: JSON.stringify({ returnTo: "/auth/welcome" }),
  });
  redirect(signInUrl);
}
