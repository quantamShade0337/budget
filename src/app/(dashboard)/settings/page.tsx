"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Trash2, X } from "lucide-react";
import { useSanity, computeInitials } from "@/lib/store";

export default function SettingsPage() {
  const { data, setUser, reset } = useSanity();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(data.user?.name ?? "");

  const saveName = () => {
    if (!name.trim() || !data.user) {
      setEditingName(false);
      return;
    }
    setUser({ ...data.user, name: name.trim(), initials: computeInitials(name) });
    setEditingName(false);
  };

  const logout = () => {
    reset();
    router.replace("/login");
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4">
          <h1 className="text-[15px] font-semibold text-neutral-900">Settings</h1>
        </div>

        <div className="max-w-lg mx-auto px-8 py-8 space-y-6">
          <Section title="Account">
            <Row label="Name">
              {editingName ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  autoFocus
                  className="text-[13px] text-neutral-900 outline-none bg-transparent text-right"
                />
              ) : (
                <Value onClick={() => setEditingName(true)}>{data.user?.name}</Value>
              )}
            </Row>
            <RowDivider />
            <Row label="Email">
              <Value>{data.user?.email}</Value>
            </Row>
            <RowDivider />
            <Row label="Phone">
              <Value>{data.user?.phone ?? "—"}</Value>
            </Row>
          </Section>

          <Section title="Security">
            <RowLink label="Notifications" />
            <RowDivider />
            <RowLink label="Apps and agents" />
            <RowDivider />
            <RowLink label="Passkeys" />
            <RowDivider />
            <RowLink label="Login activity" />
          </Section>

          <Section title="Data">
            <Row label="Connected sources">
              <Value>{data.sources.length}</Value>
            </Row>
            <RowDivider />
            <Row label="Accounts">
              <Value>{data.accounts.length}</Value>
            </Row>
            <RowDivider />
            <Row label="Transactions">
              <Value>{data.transactions.length}</Value>
            </Row>
            <RowDivider />
            <RowLink label="Export data" />
          </Section>

          <Section title="Preferences">
            <Row label="Currency">
              <Value>{data.spendingPlan.currency}</Value>
            </Row>
            <RowDivider />
            <Row label="Time zone">
              <Value>Asia/Singapore</Value>
            </Row>
            <RowDivider />
            <Row label="Theme">
              <Value>System</Value>
            </Row>
          </Section>

          <div className="flex gap-2 pt-2">
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
              This removes all accounts, transactions, and settings from this device. This action
              can&apos;t be undone.
            </p>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-9 px-4 text-[13px] text-neutral-700 rounded-full border border-neutral-200 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  reset();
                  router.replace("/login");
                }}
                className="h-9 px-4 text-[13px] font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                Delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-2 px-1">
        {title}
      </p>
      <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
      <span className="text-[13px] text-neutral-700">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function RowLink({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] hover:bg-neutral-50/80 transition-colors text-left">
      <span className="text-[13px] text-neutral-700">{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-300" strokeWidth={1.75} />
    </button>
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
  const baseClass = "text-[13px] text-neutral-400 flex items-center gap-1.5";
  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} hover:text-neutral-700 transition-colors`}>
        {children}
        <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    );
  }
  return <span className={baseClass}>{children}</span>;
}
