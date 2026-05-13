import type { Metadata } from "next";
import "./globals.css";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { SanityProvider } from "@/lib/store";
import { WorkOSAuthBridge } from "@/components/auth/workos-auth-bridge";
import { GmailReceiptScanner } from "@/lib/gmail-scanner";
import { isWorkOSConfigured } from "@/lib/workos-config";

export const metadata: Metadata = {
  title: "Sanity — Calm money",
  description: "All your transactions, in one quiet place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const workosConfigured = isWorkOSConfigured();
  const app = (
    <SanityProvider>
      <GmailReceiptScanner />
      {workosConfigured && <WorkOSAuthBridge />}
      {children}
    </SanityProvider>
  );

  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {workosConfigured ? <AuthKitProvider onSessionExpired={false}>{app}</AuthKitProvider> : app}
      </body>
    </html>
  );
}
