"use client";

import { useState, useMemo } from "react";
import { useSanity } from "@/lib/store";
import { formatCurrency } from "@/lib/calculations";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { MerchantDetailPanel } from "@/components/merchants/merchant-detail";
import type { Merchant, Currency } from "@/lib/types";

export default function MerchantsPage() {
  const { data } = useSanity();
  const [selected, setSelected] = useState<Merchant | null>(null);

  // Derive merchants from actual transactions so totals stay accurate
  const derived = useMemo<Merchant[]>(() => {
    const map = new Map<string, Merchant>();
    for (const t of data.transactions) {
      const key = t.merchantName.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.totalSpent += t.amount;
        existing.transactionCount += 1;
        if (new Date(t.date) > new Date(existing.lastTransactionDate)) {
          existing.lastTransactionDate = t.date;
        }
      } else {
        map.set(key, {
          id: t.merchantId,
          userId: t.userId,
          name: t.merchantName,
          normalizedName: key,
          defaultBucket: t.bucket,
          totalSpent: t.amount,
          transactionCount: 1,
          lastTransactionDate: t.date,
          currency: t.currency as Currency,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [data.transactions]);

  return (
    <div className="flex h-full overflow-hidden" onClick={() => setSelected(null)}>
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4">
          <h1 className="text-[15px] font-semibold text-neutral-900">Merchants</h1>
        </div>

        <div className="px-8 py-6">
          {derived.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[14px] font-medium text-neutral-900 mb-1">No merchants yet</p>
              <p className="text-[13px] text-neutral-500 max-w-sm mx-auto">
                Merchants appear here as soon as you add transactions.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_120px] gap-4 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/40">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em]">
                  Merchant
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em]">
                  Transactions
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] text-right">
                  Total spent
                </span>
              </div>

              {derived.map((m, i) => {
                const isSelected = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(isSelected ? null : m);
                    }}
                    className={`w-full grid grid-cols-[1fr_120px_120px] gap-4 items-center px-4 py-3.5 hover:bg-neutral-50/80 transition-colors text-left ${
                      isSelected ? "bg-neutral-50" : ""
                    } ${i < derived.length - 1 ? "border-b border-neutral-100" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MerchantIcon name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-neutral-900 truncate">{m.name}</p>
                        <p className="text-[11px] text-neutral-400 truncate capitalize">
                          {m.defaultBucket}
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] text-neutral-500 tabular-nums">
                      {m.transactionCount}
                    </span>
                    <span className="text-[14px] tabular-nums font-medium text-neutral-900 text-right">
                      {formatCurrency(m.totalSpent, m.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="w-[360px] shrink-0 border-l border-neutral-200/70 overflow-hidden animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          <MerchantDetailPanel merchant={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
