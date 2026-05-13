"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronRight,
  Database,
  Download,
  Landmark,
  LogOut,
  Mail,
  Palette,
  Pencil,
  Plug,
  ShieldCheck,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useSanity, computeInitials, DEFAULT_MONOGRAM } from "@/lib/store";
import { clearStoredGoogleToken } from "@/lib/google-firebase-auth";
import { Monogram } from "@/components/ui/monogram";
import { MonogramPicker } from "@/components/ui/monogram-picker";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function SettingsPage() {
  const { data, setUser, setMonogram, reset } = useSanity();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(data.user?.name ?? "");
  const [picking, setPicking] = useState(false);

  const userName = data.user?.name ?? "Local user";
  const userEmail = data.user?.email ?? "No email saved";
  const initials = data.user?.initials || computeInitials(userName) || "S";
  const monoLetter = userName?.[0] ?? "?";
  const monoConfig = data.user?.monogram ?? DEFAULT_MONOGRAM;
  const hasGmail = data.sources.some((source) => source.type === "gmail");

  const saveName = () => {
    if (!name.trim() || !data.user) {
      setName(data.user?.name ?? "");
      setEditingName(false);
      return;
    }
    setUser({ ...data.user, name: name.trim(), initials: computeInitials(name) });
    setEditingName(false);
  };

  const workosEnabled = Boolean(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI);

  const logout = () => {
    clearStoredGoogleToken();
    reset();
    if (workosEnabled) {
      window.location.href = "/auth/workos/sign-out";
    } else {
      router.replace("/login");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sanity-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4">
          <h1 className="text-[15px] font-semibold text-neutral-900">Settings</h1>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-7">
          <div className="bg-white border border-neutral-200/70 rounded-2xl p-5 flex items-center gap-4">
            <button
              onClick={() => setPicking(true)}
              className="relative group shrink-0"
              aria-label="Edit monogram"
            >
              <Monogram letter={monoLetter} config={monoConfig} size="xl" interactive />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm">
                <Pencil className="w-3 h-3 text-neutral-600" strokeWidth={2} />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-neutral-900 truncate">{userName}</p>
              <p className="text-[13px] text-neutral-500 truncate mt-0.5">{userEmail}</p>
              <p className="text-[12px] text-neutral-400 mt-2">
                Tap your monogram to change color or pick an emoji.
              </p>
            </div>
            <button
              onClick={() => setEditingName(true)}
              className="h-9 px-4 rounded-full border border-neutral-200 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0"
            >
              Edit profile
            </button>
          </div>

          <Section
            icon={<UserRound className="w-3.5 h-3.5" strokeWidth={1.75} />}
            title="Profile"
            description="The name and contact details shown across Sanity."
          >
            <Row label="Display name" helper="Used for your sidebar, greeting, and avatar.">
              {editingName ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") {
                      setName(data.user?.name ?? "");
                      setEditingName(false);
                    }
                  }}
                  autoFocus
                  className="text-[13px] text-neutral-900 outline-none bg-transparent text-right"
                />
              ) : (
                <Value onClick={() => setEditingName(true)}>{userName}</Value>
              )}
            </Row>
            <RowDivider />
            <Row label="Email" helper="Used for sign-in and account recovery.">
              <Value>{userEmail}</Value>
            </Row>
            <RowDivider />
            <Row label="Phone" helper="Optional. Not required for this local setup.">
              <Value>{data.user?.phone ?? "Not added"}</Value>
            </Row>
          </Section>

          <Section
            icon={<Plug className="w-3.5 h-3.5" strokeWidth={1.75} />}
            title="Connections"
            description="Manage where transactions and receipts come from."
          >
            <ActionLink
              href="/sources"
              icon={<Mail className="w-4 h-4" strokeWidth={1.75} />}
              label="Gmail receipt scanning"
              helper={hasGmail ? "Connected. Scans recent receipts after refresh." : "Connect Google to scan receipts."}
              value={hasGmail ? "On" : "Off"}
            />
            <RowDivider />
            <ActionLink
              href="/sources"
              icon={<Plug className="w-4 h-4" strokeWidth={1.75} />}
              label="Connected sources"
              helper="Email, statement, Gmail, and manual imports."
              value={String(data.sources.length)}
            />
          </Section>

          <Section
            icon={<Database className="w-3.5 h-3.5" strokeWidth={1.75} />}
            title="Data"
            description="Review your local data and export a backup."
          >
            <ActionLink
              href="/accounts"
              icon={<Landmark className="w-4 h-4" strokeWidth={1.75} />}
              label="Accounts"
              helper="Bank accounts, cards, cash, wallets, and investments."
              value={String(data.accounts.length)}
            />
            <RowDivider />
            <ActionLink
              href="/activity"
              icon={<Activity className="w-4 h-4" strokeWidth={1.75} />}
              label="Transactions"
              helper="All imported and manually added spending activity."
              value={String(data.transactions.length)}
            />
            <RowDivider />
            <ActionButton
              icon={<Download className="w-4 h-4" strokeWidth={1.75} />}
              label="Export data"
              helper="Download a JSON backup of everything on this device."
              onClick={exportData}
            />
          </Section>

          <Section
            icon={<WalletCards className="w-3.5 h-3.5" strokeWidth={1.75} />}
            title="Budget preferences"
            description="Defaults used for budgets, balances, and display."
          >
            <Row label="Currency" helper="Used by your monthly plan.">
              <Value>{data.spendingPlan.currency}</Value>
            </Row>
            <RowDivider />
            <Row label="Monthly plan" helper="Fixed split for needs, wants, and savings.">
              <Value>
                {data.spendingPlan.needsPercent}/{data.spendingPlan.wantsPercent}/
                {data.spendingPlan.savingsPercent}
              </Value>
            </Row>
            <RowDivider />
            <Row label="Theme" helper="Visual theme for the app.">
              <Value>System</Value>
            </Row>
          </Section>

          <Section
            icon={<ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />}
            title="Security"
            description="Auth and notification controls coming next."
          >
            <ComingSoonRow icon={<Bell className="w-4 h-4" strokeWidth={1.75} />} label="Notifications" />
            <RowDivider />
            <ComingSoonRow icon={<ShieldCheck className="w-4 h-4" strokeWidth={1.75} />} label="Passkeys" />
            <RowDivider />
            <ComingSoonRow icon={<Palette className="w-4 h-4" strokeWidth={1.75} />} label="Login activity" />
          </Section>

          <div className="bg-white border border-red-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[14px] font-semibold text-neutral-900">Session & device data</p>
                <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">
                  Log out clears this local session. Deleting data removes all saved accounts,
                  transactions, sources, and settings from this device.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 h-9 px-4 text-[13px] text-neutral-700 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                Log out
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 h-9 px-4 text-[13px] text-red-500 border border-red-100 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Delete all data
              </button>
            </div>
          </div>
        </div>
      </div>

      {picking && (
        <MonogramPicker
          initialConfig={monoConfig}
          letter={monoLetter}
          onSave={setMonogram}
          onClose={() => setPicking(false)}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-neutral-900">Delete all data?</h3>
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
              </button>
            </div>
            <p className="px-6 pb-5 text-[13px] text-neutral-500">
              This removes all accounts, transactions, sources, and settings from this device. This
              action can&apos;t be undone.
            </p>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-9 px-4 text-[13px] text-neutral-700 rounded-full border border-neutral-200 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <AnimatedButton
                variant="danger"
                size="sm"
                onClick={() => {
                  clearStoredGoogleToken();
                  reset();
                }}
                onSuccess={() => {
                  if (workosEnabled) {
                    window.location.href = "/auth/workos/sign-out";
                  } else {
                    router.replace("/login");
                  }
                }}
              >
                Delete everything
              </AnimatedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 px-1 mb-2">
        <span className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center">
          {icon}
        </span>
        <div>
          <p className="text-[12px] font-semibold text-neutral-900">{title}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 min-h-[54px]">
      <div className="min-w-0">
        <span className="text-[13px] text-neutral-800">{label}</span>
        {helper && <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{helper}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  label,
  helper,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  helper: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="w-full flex items-center justify-between gap-4 px-4 py-3 min-h-[58px] hover:bg-neutral-50/80 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-900">{label}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{helper}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] text-neutral-400 tabular-nums">{value}</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" strokeWidth={1.75} />
      </div>
    </Link>
  );
}

function ActionButton({
  icon,
  label,
  helper,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  helper: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-4 py-3 min-h-[58px] hover:bg-neutral-50/80 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-900">{label}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{helper}</p>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

function ComingSoonRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 px-4 py-3 min-h-[54px] text-left">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="text-[13px] text-neutral-700">{label}</span>
      </div>
      <span className="text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-full px-2 py-0.5">
        Coming soon
      </span>
    </div>
  );
}

function RowDivider() {
  return <div className="border-b border-neutral-100 mx-4" />;
}

function Value({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const baseClass = "text-[13px] text-neutral-500 flex items-center gap-1.5";
  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} hover:text-neutral-800 transition-colors`}>
        {children}
        <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    );
  }
  return <span className={baseClass}>{children}</span>;
}
