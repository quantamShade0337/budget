"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSanity } from "@/lib/store";
import { formatCurrency, getDaysUntil } from "@/lib/calculations";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { useDetailPanel } from "@/components/ui/use-detail-panel";
import { RecurringDetailPanel } from "@/components/recurring/recurring-detail";
import { AddRecurringModal } from "@/components/recurring/add-recurring-modal";
import type { RecurringTransaction } from "@/lib/types";

export default function RecurringPage() {
  const { data } = useSanity();
  const panel = useDetailPanel<RecurringTransaction>();
  const [addOpen, setAddOpen] = useState(false);
  const defaultCurrency = data.spendingPlan.currency;

  const active = data.recurring
    .filter((r) => r.active)
    .sort(
      (a, b) =>
        new Date(a.expectedNextDate).getTime() - new Date(b.expectedNextDate).getTime()
    );

  return (
    <div className="flex h-full overflow-hidden" onClick={() => panel.close()}>
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold text-neutral-900">Recurring</h1>
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

        <div className="px-8 py-6">
          {active.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[14px] font-medium text-neutral-900 mb-1">No subscriptions yet</p>
              <p className="text-[13px] text-neutral-500 mb-6 max-w-sm mx-auto">
                Track Netflix, Spotify, AWS — anything that bills you on a schedule.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-neutral-900 text-white rounded-full text-[13px] font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Add recurring
              </button>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_160px_120px] gap-4 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/40">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em]">
                  Active
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em]">
                  Expected on
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] text-right">
                  Amount
                </span>
              </div>

              {active.map((rec, i) => {
                const days = getDaysUntil(rec.expectedNextDate);
                const nextDate = new Date(rec.expectedNextDate);
                const isSelected = panel.selected?.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      panel.toggle(rec);
                    }}
                    style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                    className={`w-full grid grid-cols-[1fr_160px_120px] gap-4 items-center px-4 py-3.5 hover:bg-neutral-50/80 transition-colors text-left animate-row-fade-in ${
                      isSelected ? "bg-neutral-50" : ""
                    } ${i < active.length - 1 ? "border-b border-neutral-100" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MerchantIcon name={rec.merchantName} size="sm" />
                      <span className="text-[14px] font-medium text-neutral-900 truncate">
                        {rec.merchantName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-neutral-500 tabular-nums">
                        {nextDate.toLocaleDateString("en-SG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {days >= 0 && days <= 7 && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          {days === 0 ? "today" : `${days}d`}
                        </span>
                      )}
                    </div>
                    <span className="text-[14px] tabular-nums font-medium text-neutral-900 text-right">
                      {formatCurrency(rec.amount, rec.currency, { defaultCurrency })}
                    </span>
                  </button>
                );
              })}
            </div>
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
          <RecurringDetailPanel recurring={panel.rendered} onClose={panel.close} />
        </div>
      )}

      {addOpen && <AddRecurringModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
