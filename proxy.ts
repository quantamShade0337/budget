import { authkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isWorkOSConfigured } from "./src/lib/workos-config";

const workosProxy = isWorkOSConfigured() ? authkitProxy() : null;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!workosProxy) return NextResponse.next();
  return workosProxy(request, event);
}

export const config = {
  matcher: [
    "/auth/workos/:path*",
    "/login",
    "/onboarding",
    "/home",
    "/activity",
    "/recurring",
    "/accounts",
    "/merchants",
    "/plan",
    "/sources",
    "/settings",
  ],
};
