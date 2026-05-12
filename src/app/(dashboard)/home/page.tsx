"use client";

import { useState } from "react";
import { ChevronRight, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useSanity } from "@/lib/store";
import {
  calculateSafeToSpend,
  formatCurrency,
  getTotalBalance,
  getTotalProtected,
  getSpendableFromAccounts,
  getDaysUntil,
  getMonthlyBucketSpend,
} from "@/lib/calculations";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import type { Transaction } from "@/lib/types";
import { TransactionDetailPanel } from "@/components/activity/transaction-detail";

export default function HomePage() {
  const { data } = useSanity();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currency = data.spendingPlan.currency;

  const breakdown = calculateSafeToSpend(
    data.accounts,
    data.recurring,
    data.transactions,
    data.spendingPlan,
    year,
    month
  );

  const totalBalance = getTotalBalance(data.accounts);
  const totalProtected = getTotalProtected(data.accounts);
  const spendable = getSpendableFromAccounts(data.accounts);

  const needsBudget = data.spendingPlan.monthlyIncome * (data.spendingPlan.needsPercent / 100);
  const wantsBudget = data.spendingPlan.monthlyIncome * (data.spendingPlan.wantsPercent / 100);
  const savingsBudget = data.spendingPlan.monthlyIncome * (data.spendingPlan.savingsPercent / 100);
  const needsSpent = getMonthlyBucketSpend(data.transactions, "needs", year, month);
  const wantsSpent = getMonthlyBucketSpend(data.transactions, "wants", year, month);
  const totalSpentThisMonth = needsSpent + wantsSpent;

  const recentTxns = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingRecurring = [...data.recurring]
    .filter((r) => r.active)
    .sort(
      (a, b) =>
        new Date(a.expectedNextDate).getTime() - new Date(b.expectedNextDate).getTime()
    )
    .slice(0, 4);

  const firstName = data.user?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className="flex-1 overflow-y-auto"
        onClick={() => selectedTxn && setSelectedTxn(null)}
      >
        <div className="max-w-[680px] mx-auto px-8 pt-14 pb-16">
          {/* Greeting */}
          <div className="mb-10">
            <h1 className="text-[28px] font-semibold text-neutral-900 tracking-tight leading-tight">
              Hi, {firstName}
            </h1>
            <p className="text-neutral-500 text-[15px] mt-1">Here&apos;s the latest.</p>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard
              label="Safe to spend"
              value={formatCurrency(breakdown.safeToSpend, currency)}
              hint={
                breakdown.safeToSpend === 0 && breakdown.upcomingRecurringTotal > spendable ? (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-3 h-3" strokeWidth={2} />
                    {formatCurrency(breakdown.upcomingRecurringTotal - spendable, currency)} below
                    buffer
                  </span>
                ) : (
                  `${formatCurrency(totalProtected, currency)} protected`
                )
              }
            />
            <StatCard
              label="Total balance"
              value={formatCurrency(totalBalance, currency)}
              hint={`${formatCurrency(spendable, currency)} above protected`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <StatCard
              label="This month"
              value={formatCurrency(totalSpentThisMonth, currency)}
              hint={
                totalSpentThisMonth > 0
                  ? [
                      needsSpent > 0 && `${formatCurrency(needsSpent, currency)} needs`,
                      wantsSpent > 0 && `${formatCurrency(wantsSpent, currency)} wants`,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "Nothing spent yet"
              }
            />
            <StatCard
              label="Upcoming"
              value={formatCurrency(breakdown.upcomingRecurringTotal, currency)}
              hint={`${data.recurring.filter((r) => r.active).length} active`}
            />
          </div>

          {/* Recent */}
          <Section
            title="Recent"
            href="/activity"
            empty={recentTxns.length === 0}
            emptyState={
              <EmptyState
                title="No activity yet"
                action="Connect a source"
                href="/sources"
                description="Transactions appear here automatically when you connect Gmail or upload a statement."
              />
            }
          >
            <List>
              {recentTxns.map((txn, i) => (
                <Row
                  key={txn.id}
                  selected={selectedTxn?.id === txn.id}
                  isLast={i === recentTxns.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTxn(txn.id === selectedTxn?.id ? null : txn);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MerchantIcon name={txn.merchantName} size="sm" />
                    <span className="text-[14px] font-medium text-neutral-900 truncate">
                      {txn.merchantName}
                    </span>
                  </div>
                  <span className="text-[14px] tabular-nums text-neutral-700 font-medium">
                    {formatCurrency(txn.amount, txn.currency)}
                  </span>
                </Row>
              ))}
            </List>
          </Section>

          {/* Upcoming */}
          <Section
            title="Upcoming"
            href="/recurring"
            empty={upcomingRecurring.length === 0}
            emptyState={
              <EmptyState
                title="No subscriptions"
                action="Add recurring"
                href="/recurring"
                description="Track Netflix, Spotify, AWS, anything that bills you regularly."
              />
            }
          >
            <List>
              {upcomingRecurring.map((rec, i) => {
                const days = getDaysUntil(rec.expectedNextDate);
                return (
                  <Row key={rec.id} isLast={i === upcomingRecurring.length - 1}>
                    <div className="flex items-center gap-3 min-w-0">
                      <MerchantIcon name={rec.merchantName} size="sm" />
                      <span className="text-[14px] font-medium text-neutral-900 truncate">
                        {rec.merchantName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-neutral-400 tabular-nums">
                        {days <= 0 ? "today" : `${days} days`}
                      </span>
                      <span className="text-[14px] tabular-nums text-neutral-700 font-medium">
                        {formatCurrency(rec.amount, rec.currency)}
                      </span>
                    </div>
                  </Row>
                );
              })}
            </List>
          </Section>

          {/* Plan */}
          {data.spendingPlan.monthlyIncome > 0 && (
            <Section title="Plan" href="/plan">
              <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
                {[
                  {
                    label: "Needs",
                    spent: needsSpent,
                    budget: needsBudget,
                    color: "bg-neutral-900",
                  },
                  {
                    label: "Wants",
                    spent: wantsSpent,
                    budget: wantsBudget,
                    color: "bg-neutral-500",
                  },
                  {
                    label: "Savings",
                    spent: 0,
                    budget: savingsBudget,
                    color: "bg-neutral-300",
                  },
                ].map((row, i, arr) => {
                  const pct = row.budget > 0 ? Math.min(100, (row.spent / row.budget) * 100) : 0;
                  return (
                    <div
                      key={row.label}
                      className={`px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-neutral-100" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[13px] text-neutral-700">{row.label}</span>
                        <span className="text-[12px] tabular-nums text-neutral-400">
                          {formatCurrency(row.spent, currency)} ·{" "}
                          {formatCurrency(row.budget, currency)}
                        </span>
                      </div>
                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${row.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>

      {selectedTxn && (
        <div
          className="w-[360px] shrink-0 border-l border-neutral-200/70 overflow-y-auto animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          <TransactionDetailPanel
            transaction={selectedTxn}
            onClose={() => setSelectedTxn(null)}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl px-5 py-4 transition-colors hover:border-neutral-300/70">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-2.5">
        {label}
      </p>
      <p className="text-[22px] font-semibold text-neutral-900 tabular-nums leading-none">
        {value}
      </p>
      {hint && <p className="text-[12px] text-neutral-500 mt-2">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  href,
  empty,
  emptyState,
  children,
}: {
  title: string;
  href?: string;
  empty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[13px] font-semibold text-neutral-900">{title}</h2>
        {href && !empty && (
          <Link
            href={href}
            className="text-[12px] text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-0.5"
          >
            See all <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
          </Link>
        )}
      </div>
      {empty && emptyState ? emptyState : children}
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
      {children}
    </div>
  );
}

function Row({
  children,
  isLast,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
        onClick ? "hover:bg-neutral-50/80 cursor-pointer" : ""
      } ${selected ? "bg-neutral-50" : ""} ${!isLast ? "border-b border-neutral-100" : ""}`}
    >
      {children}
    </Cmp>
  );
}

function EmptyState({
  title,
  description,
  action,
  href,
}: {
  title: string;
  description?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="bg-white border border-dashed border-neutral-200 rounded-xl px-5 py-7 text-center">
      <p className="text-[14px] font-medium text-neutral-900 mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-neutral-500 mb-4 max-w-xs mx-auto">{description}</p>
      )}
      {action && href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {action}
        </Link>
      )}
    </div>
  );
}
