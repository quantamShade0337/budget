"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { useSanity } from "@/lib/store";
import { formatCurrency } from "@/lib/calculations";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { BucketDot } from "@/components/ui/bucket-dot";
import { useDetailPanel } from "@/components/ui/use-detail-panel";
import { TransactionDetailPanel } from "@/components/activity/transaction-detail";
import { AddTransactionModal } from "@/components/activity/add-transaction-modal";
import type { Transaction } from "@/lib/types";

function groupByMonth(transactions: Transaction[]) {
  const groups: Record<string, { label: string; transactions: Transaction[] }> = {};
  for (const txn of transactions) {
    const d = new Date(txn.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = {
        label: d.toLocaleDateString("en-SG", { month: "long", year: "numeric" }),
        transactions: [],
      };
    }
    groups[key].transactions.push(txn);
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function ActivityPage() {
  const { data } = useSanity();
  const panel = useDetailPanel<Transaction>();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const defaultCurrency = data.spendingPlan.currency;

  const filtered = useMemo(() => {
    if (!search.trim()) return data.transactions;
    const q = search.toLowerCase();
    return data.transactions.filter(
      (t) =>
        t.merchantName.toLowerCase().includes(q) ||
        t.rawDescription.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q)
    );
  }, [search, data.transactions]);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const grouped = groupByMonth(sorted);

  return (
    <div className="flex h-full overflow-hidden" onClick={() => panel.close()}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold text-neutral-900">Activity</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/70 rounded-full px-3 py-1.5">
              <Search className="w-3 h-3 text-neutral-400" strokeWidth={2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="text-[13px] bg-transparent outline-none text-neutral-700 placeholder:text-neutral-400 w-44"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAddOpen(true);
              }}
              className="flex items-center gap-1 text-[13px] text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200/70 rounded-full px-3 py-1.5"
            >
              <Plus className="w-3 h-3" strokeWidth={2} />
              Add
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {grouped.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[14px] font-medium text-neutral-900 mb-1">No transactions yet</p>
              <p className="text-[13px] text-neutral-500 mb-6 max-w-sm mx-auto">
                Connect a source to import automatically, or add one manually.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-neutral-900 text-white rounded-full text-[13px] font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Add transaction
              </button>
            </div>
          ) : (
            grouped.map(([key, { label, transactions }]) => (
              <div key={key} className="mb-7 last:mb-0">
                <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-3 px-1">
                  {label}
                </p>

                <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
                  {transactions.map((txn, i) => {
                    const date = new Date(txn.date);
                    const isSelected = panel.selected?.id === txn.id;
                    return (
                      <button
                        key={txn.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          panel.toggle(txn);
                        }}
                        style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                        className={`w-full grid grid-cols-[1fr_180px_120px_110px] gap-4 items-center px-4 py-3 hover:bg-neutral-50/80 transition-colors text-left animate-row-fade-in ${
                          isSelected ? "bg-neutral-50" : ""
                        } ${i < transactions.length - 1 ? "border-b border-neutral-100" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <MerchantIcon name={txn.merchantName} size="sm" />
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[14px] font-medium text-neutral-900 truncate">
                              {txn.merchantName}
                            </span>
                            <BucketDot bucket={txn.bucket} />
                          </div>
                        </div>
                        <span className="text-[13px] text-neutral-500 truncate">
                          {txn.accountLast4
                            ? `${txn.accountName} ${txn.accountLast4}`
                            : txn.accountName}
                        </span>
                        <span className="text-[13px] text-neutral-500 tabular-nums">
                          {date.toLocaleDateString("en-SG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[14px] tabular-nums font-medium text-neutral-900 text-right">
                          {formatCurrency(txn.amount, txn.currency, { defaultCurrency })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {panel.rendered && (
        <div
          className={`w-[360px] shrink-0 border-l border-neutral-200/70 overflow-hidden ${
            panel.closing ? "animate-slide-out-right" : "animate-slide-in-right"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <TransactionDetailPanel transaction={panel.rendered} onClose={panel.close} />
        </div>
      )}

      {addOpen && <AddTransactionModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
