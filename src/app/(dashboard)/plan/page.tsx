"use client";

import { useState } from "react";
import { AlertCircle, PencilLine, Check } from "lucide-react";
import { useSanity } from "@/lib/store";
import {
  calculateSafeToSpend,
  formatCurrency,
  getSpendableFromAccounts,
  getMonthlyBucketSpend,
  getBudgetProgress,
} from "@/lib/calculations";

export default function PlanPage() {
  const { data, setIncome } = useSanity();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.spendingPlan.monthlyIncome.toFixed(2));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const plan = data.spendingPlan;
  const currency = plan.currency;

  const needsBudget = plan.monthlyIncome * (plan.needsPercent / 100);
  const wantsBudget = plan.monthlyIncome * (plan.wantsPercent / 100);
  const savingsBudget = plan.monthlyIncome * (plan.savingsPercent / 100);

  const needsSpent = getMonthlyBucketSpend(data.transactions, "needs", year, month);
  const wantsSpent = getMonthlyBucketSpend(data.transactions, "wants", year, month);
  const savingsDone = getMonthlyBucketSpend(data.transactions, "savings", year, month);

  const breakdown = calculateSafeToSpend(
    data.accounts,
    data.recurring,
    data.transactions,
    plan,
    year,
    month
  );

  const spendable = getSpendableFromAccounts(data.accounts);

  const buckets = [
    {
      label: "Needs",
      percent: plan.needsPercent,
      budget: needsBudget,
      spent: needsSpent,
      barColor: "bg-neutral-900",
      description: "Housing, food, transport, utilities",
    },
    {
      label: "Wants",
      percent: plan.wantsPercent,
      budget: wantsBudget,
      spent: wantsSpent,
      barColor: "bg-neutral-500",
      description: "Entertainment, dining out, hobbies",
    },
    {
      label: "Savings",
      percent: plan.savingsPercent,
      budget: savingsBudget,
      spent: savingsDone,
      barColor: "bg-emerald-600",
      description: "Emergency fund, investments, goals",
    },
  ];

  const commitIncome = () => {
    const n = parseFloat(editValue);
    if (!isNaN(n)) setIncome(n);
    setEditing(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4">
          <h1 className="text-[15px] font-semibold text-neutral-900">Plan</h1>
        </div>

        <div className="max-w-[680px] mx-auto px-8 py-8 space-y-6">
          {/* Monthly income */}
          <div className="bg-white border border-neutral-200/70 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em]">
                Monthly income
              </p>
              <button
                onClick={() => {
                  if (editing) commitIncome();
                  else {
                    setEditValue(plan.monthlyIncome.toFixed(2));
                    setEditing(true);
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                {editing ? (
                  <>
                    <Check className="w-3 h-3" strokeWidth={2.5} /> Save
                  </>
                ) : (
                  <>
                    <PencilLine className="w-3 h-3" strokeWidth={2} /> Edit
                  </>
                )}
              </button>
            </div>

            {editing ? (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[15px] text-neutral-400">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commitIncome()}
                  className="text-[24px] font-semibold text-neutral-900 outline-none tabular-nums bg-transparent w-56"
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-[24px] font-semibold text-neutral-900 tabular-nums mt-1 leading-none">
                {formatCurrency(plan.monthlyIncome, currency)}
              </p>
            )}
          </div>

          {/* 60/20/20 */}
          <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="text-[14px] font-semibold text-neutral-900">60 / 20 / 20 rule</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                60% needs · 20% wants · 20% savings
              </p>
            </div>

            {buckets.map((b, i) => {
              const pct = getBudgetProgress(b.spent, b.budget);
              const remaining = Math.max(0, b.budget - b.spent);
              const over = b.spent > b.budget;
              return (
                <div
                  key={b.label}
                  className={`px-5 py-4 ${i < buckets.length - 1 ? "border-b border-neutral-100" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-neutral-900">{b.label}</span>
                      <span className="text-[11px] text-neutral-400">{b.percent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] tabular-nums text-neutral-900 font-medium">
                        {formatCurrency(b.spent, currency)}
                      </span>
                      <span className="text-[11px] text-neutral-400 ml-1.5">
                        / {formatCurrency(b.budget, currency)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 mb-2.5">{b.description}</p>

                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-400" : b.barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {over ? (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-400" strokeWidth={2} />
                        <span className="text-[11px] text-red-500">
                          {formatCurrency(b.spent - b.budget, currency)} over
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 tabular-nums">
                        {formatCurrency(remaining, currency)} remaining
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-400 tabular-nums">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safe-to-spend breakdown */}
          <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="text-[14px] font-semibold text-neutral-900">Safe to spend</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                How your money is allocated this month
              </p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <BRow
                label="Available above protected"
                value={formatCurrency(spendable, currency)}
              />
              <BRow
                label="− Upcoming recurring"
                value={`−${formatCurrency(breakdown.upcomingRecurringTotal, currency)}`}
              />
              <BRow
                label="− Remaining needs"
                value={`−${formatCurrency(breakdown.remainingNeedsEstimate, currency)}`}
              />
              <BRow
                label="− Savings target"
                value={`−${formatCurrency(breakdown.remainingSavingsTarget, currency)}`}
              />

              <div className="pt-3 border-t border-neutral-100">
                <BRow
                  label="Safe to spend"
                  value={formatCurrency(breakdown.safeToSpend, currency)}
                  bold
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${bold ? "font-semibold text-neutral-900" : "text-neutral-500"}`}>
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold ? "text-[15px] font-semibold text-neutral-900" : "text-[13px] font-medium text-neutral-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
