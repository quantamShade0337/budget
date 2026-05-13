"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSanity } from "@/lib/store";
import { AnimatedButton } from "@/components/ui/animated-button";
import type { AccountType, Currency } from "@/lib/types";

const TYPES: { value: AccountType; label: string }[] = [
  { value: "savings", label: "Savings" },
  { value: "current", label: "Current" },
  { value: "debit", label: "Debit card" },
  { value: "credit", label: "Credit card" },
  { value: "wallet", label: "Wallet" },
  { value: "cash", label: "Cash" },
];

const CURRENCIES: Currency[] = ["SGD", "USD", "MYR", "GBP", "EUR"];

export function AddAccountModal({ onClose }: { onClose: () => void }) {
  const { addAccount } = useSanity();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("savings");
  const [bank, setBank] = useState("");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState("");
  const [protectedAmt, setProtectedAmt] = useState("");
  const [currency, setCurrency] = useState<Currency>("SGD");

  const submit = () => {
    const bal = parseFloat(balance);
    if (!name.trim() || isNaN(bal)) return;
    const prot = parseFloat(protectedAmt || "0");
    addAccount({
      name: name.trim(),
      type,
      bankName: bank.trim() || name.trim(),
      currency,
      currentBalance: bal,
      protectedBalance: isNaN(prot) ? 0 : prot,
      last4: last4.trim() || undefined,
      cardNetwork: type === "debit" || type === "credit" ? "visa" : undefined,
      color: "#0a0a0a",
    });
  };

  const canSubmit = Boolean(name.trim() && balance);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-neutral-900">Add account</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 pb-5 space-y-3.5">
          <Field label="Account name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DBS Multiplier"
              autoFocus
              className={inputStyle}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className={inputStyle}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className={inputStyle}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Bank">
              <input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="DBS"
                className={inputStyle}
              />
            </Field>
            <Field label="Last 4">
              <input
                value={last4}
                maxLength={4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label={`Balance (${currency})`}>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className={inputStyle + " tabular-nums"}
              />
            </Field>
            <Field label={`Protected (${currency})`}>
              <input
                type="number"
                step="0.01"
                value={protectedAmt}
                onChange={(e) => setProtectedAmt(e.target.value)}
                placeholder="0.00"
                className={inputStyle + " tabular-nums"}
              />
            </Field>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] text-neutral-700 rounded-full border border-neutral-200 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <AnimatedButton
            onClick={submit}
            disabled={!canSubmit}
            size="sm"
            onSuccess={onClose}
          >
            Add account
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

const inputStyle =
  "w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-neutral-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
