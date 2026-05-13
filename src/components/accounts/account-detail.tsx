"use client";

import { useState } from "react";
import { X, RefreshCw, Lock, History, Activity, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";
import { useSanity } from "@/lib/store";
import { AnimatedButton } from "@/components/ui/animated-button";
import type { Account } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  savings: "Savings",
  current: "Current",
  debit: "Debit card",
  credit: "Credit card",
  cash: "Cash",
  wallet: "Wallet",
  investment: "Investment",
};

interface ValueModalProps {
  title: string;
  description?: string;
  label: string;
  currency: string;
  initialValue: number;
  onSave: (n: number) => void;
  onClose: () => void;
}

function ValueModal({ title, description, label, currency, initialValue, onSave, onClose }: ValueModalProps) {
  const [value, setValue] = useState(initialValue.toFixed(2));
  const parsed = parseFloat(value);
  const valid = !isNaN(parsed);
  const submit = () => {
    if (valid) onSave(parsed);
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 pb-5">
          {description && <p className="text-[12px] text-neutral-500 mb-3">{description}</p>}
          <label className="block">
            <span className="text-[11px] font-medium text-neutral-500 mb-1 block">{label}</span>
            <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 h-10 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/5 transition-all">
              <span className="text-[12px] text-neutral-400">{currency}</span>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                className="flex-1 text-[14px] text-neutral-900 outline-none tabular-nums"
              />
            </div>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] text-neutral-700 rounded-full border border-neutral-200 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <AnimatedButton onClick={submit} disabled={!valid} size="sm" onSuccess={onClose}>
            Save
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

interface AccountDetailPanelProps {
  account: Account;
  onClose: () => void;
}

export function AccountDetailPanel({ account, onClose }: AccountDetailPanelProps) {
  const { updateAccount, removeAccount } = useSanity();
  const [modal, setModal] = useState<"balance" | "protected" | null>(null);

  const available = Math.max(0, account.currentBalance - account.protectedBalance);
  const updatedAt = new Date(account.balanceUpdatedAt);

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-[13px] font-medium text-neutral-500">Account</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 pt-6 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[11px] font-bold tracking-wide shrink-0"
              style={{ backgroundColor: account.color ?? "#0a0a0a" }}
            >
              {account.bankName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-neutral-900 leading-tight">
                {account.name}
                {account.last4 && (
                  <span className="text-neutral-400 font-normal ml-1">•••• {account.last4}</span>
                )}
              </p>
              <p className="text-[12px] text-neutral-400 mt-0.5">
                {account.bankName} · {TYPE_LABELS[account.type] ?? account.type}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Row label="Balance" emphasis>
              {formatCurrency(account.currentBalance, account.currency)}
            </Row>
            <Row label="Protected">
              {formatCurrency(account.protectedBalance, account.currency)}
            </Row>
            <div className="pt-2.5 border-t border-neutral-100">
              <Row label="Available" valueClassName={available > 0 ? "text-emerald-700" : "text-red-500"}>
                {formatCurrency(available, account.currency)}
              </Row>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 mt-4">
            Updated{" "}
            {updatedAt.toLocaleDateString("en-SG", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
          <Action
            icon={<RefreshCw className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />}
            label="Update balance"
            onClick={() => setModal("balance")}
          />
          <Action
            icon={<Lock className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />}
            label="Edit protected amount"
            onClick={() => setModal("protected")}
          />
          <Action icon={<History className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Balance history" />
          <Action icon={<Activity className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="View activity" />
          <Action
            icon={<Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.75} />}
            label="Remove account"
            danger
            onClick={() => {
              removeAccount(account.id);
              onClose();
            }}
          />
        </div>
      </div>

      {modal === "balance" && (
        <ValueModal
          title="Update balance"
          description="As of now"
          label={`Current balance (${account.currency})`}
          currency={account.currency}
          initialValue={account.currentBalance}
          onSave={(n) => updateAccount(account.id, { currentBalance: n })}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "protected" && (
        <ValueModal
          title="Protect money"
          description="Keep at least this amount in the account. Excluded from safe-to-spend."
          label={`Protected amount (${account.currency})`}
          currency={account.currency}
          initialValue={account.protectedBalance}
          onSave={(n) => updateAccount(account.id, { protectedBalance: n })}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function Row({
  label,
  children,
  emphasis,
  valueClassName,
}: {
  label: string;
  children: React.ReactNode;
  emphasis?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <span
        className={`tabular-nums ${
          emphasis
            ? "text-[18px] font-semibold text-neutral-900"
            : "text-[13px] font-medium text-neutral-700"
        } ${valueClassName ?? ""}`}
      >
        {children}
      </span>
    </div>
  );
}

function Action({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-50/60 hover:bg-neutral-100 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={`text-[13px] ${danger ? "text-red-500" : "text-neutral-700"}`}>{label}</span>
      </div>
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
        <path
          d="M1 1l4 4-4 4"
          stroke="#d4d4d4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
