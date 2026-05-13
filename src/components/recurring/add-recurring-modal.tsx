"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSanity } from "@/lib/store";
import { AnimatedButton } from "@/components/ui/animated-button";
import type { TransactionBucket, RecurringInterval, Currency } from "@/lib/types";

const BUCKETS: { value: TransactionBucket; label: string }[] = [
  { value: "needs", label: "Needs" },
  { value: "wants", label: "Wants" },
  { value: "savings", label: "Savings" },
];

const INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

export function AddRecurringModal({ onClose }: { onClose: () => void }) {
  const { data, addRecurring, upsertMerchant } = useSanity();
  const [merchantName, setMerchantName] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(data.accounts[0]?.id ?? "");
  const [interval, setInterval] = useState<RecurringInterval>("monthly");
  const [nextDate, setNextDate] = useState(() =>
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [bucket, setBucket] = useState<TransactionBucket>("wants");

  const account = data.accounts.find((a) => a.id === accountId);

  const submit = () => {
    const amt = parseFloat(amount);
    if (!merchantName.trim() || isNaN(amt) || !account) return;
    const merchant = upsertMerchant({
      name: merchantName.trim(),
      normalizedName: merchantName.trim().toLowerCase(),
      defaultBucket: bucket,
      totalSpent: 0,
      transactionCount: 0,
      lastTransactionDate: nextDate,
      currency: account.currency,
    });
    addRecurring({
      merchantId: merchant.id,
      merchantName: merchant.name,
      accountId: account.id,
      accountName: account.name,
      accountLast4: account.last4,
      name: name.trim() || `${merchant.name} subscription`,
      amount: amt,
      currency: account.currency as Currency,
      interval,
      expectedNextDate: nextDate,
      active: true,
      confidence: 1.0,
      detectedFromCount: 1,
      bucket,
    });
  };

  const canSubmit = Boolean(merchantName.trim() && amount && account);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-[15px] font-semibold text-neutral-900">New recurring</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 pb-5 space-y-3.5">
          <Field label="Merchant">
            <input
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Netflix"
              autoFocus
              className={inputStyle}
            />
          </Field>
          <Field label="Plan name (optional)">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard plan"
              className={inputStyle}
            />
          </Field>
          <div className="grid grid-cols-[1fr_140px] gap-2.5">
            <Field label="Amount">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={inputStyle + " tabular-nums"}
              />
            </Field>
            <Field label="Interval">
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as RecurringInterval)}
                className={inputStyle}
              >
                {INTERVALS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Account">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={inputStyle}
            >
              {data.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.last4 ? ` •••• ${a.last4}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Next charge">
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className={inputStyle}
              />
            </Field>
            <Field label="Bucket">
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value as TransactionBucket)}
                className={inputStyle}
              >
                {BUCKETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
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
            Add recurring
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
