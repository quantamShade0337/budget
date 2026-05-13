import { handleAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { isWorkOSConfigured } from "@/lib/workos-config";

const handleWorkOSCallback = handleAuth({ returnPathname: "/auth/welcome" });

export async function GET(request: NextRequest) {
  if (!isWorkOSConfigured()) {
    redirect("/login?error=workos_not_configured");
  }

  return handleWorkOSCallback(request);
}
