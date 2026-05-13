import { signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { isWorkOSConfigured } from "@/lib/workos-config";

export async function GET() {
  if (!isWorkOSConfigured()) {
    redirect("/login");
  }

  await signOut({ returnTo: "/login" });
}
