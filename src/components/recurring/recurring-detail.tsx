"use client";

import { useState } from "react";
import { X, Globe, BellOff, Tag, History, Trash2, ChevronDown } from "lucide-react";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { formatCurrency, getDaysUntil } from "@/lib/calculations";
import { useSanity } from "@/lib/store";
import type { RecurringTransaction } from "@/lib/types";

interface RecurringDetailPanelProps {
  recurring: RecurringTransaction;
  onClose: () => void;
}

export function RecurringDetailPanel({ recurring: rec, onClose }: RecurringDetailPanelProps) {
  const { removeRecurring, data } = useSanity();
  const defaultCurrency = data.spendingPlan.currency;
  const [showMore, setShowMore] = useState(false);
  const nextDate = new Date(rec.expectedNextDate);
  const days = getDaysUntil(rec.expectedNextDate);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-[13px] font-medium text-neutral-500">Recurring</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-9 pb-6 px-5 border-b border-neutral-100">
        <MerchantIcon name={rec.merchantName} size="xl" className="mb-5" />
        <h2 className="text-[15px] font-semibold text-neutral-900">{rec.merchantName}</h2>
        <p className="text-[12px] text-neutral-400 mt-1">{rec.name}</p>
        <p className="text-[32px] font-semibold text-neutral-900 mt-5 tabular-nums leading-none">
          {formatCurrency(rec.amount, rec.currency, { defaultCurrency })}
        </p>
        <p className="text-[12px] text-neutral-400 mt-1">/ {rec.interval.replace("ly", "")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        <Row label="Expected on">
          <span className="text-[13px] text-neutral-700">
            {nextDate.toLocaleDateString("en-SG", { month: "long", day: "numeric" })}
            <span className="text-neutral-400 ml-1">({days <= 0 ? "today" : `in ${days}d`})</span>
          </span>
        </Row>

        <Row label="Payment">
          <span className="text-[13px] text-neutral-700">
            {rec.accountName}{rec.accountLast4 ? ` ${rec.accountLast4}` : ""}
          </span>
        </Row>

        {rec.categoryName && (
          <Row label="Category">
            <span className="text-[13px] text-neutral-700">{rec.categoryName}</span>
          </Row>
        )}

        {/* More details disclosure */}
        <button
          onClick={() => setShowMore((s) => !s)}
          className="w-full flex items-center justify-between py-1 group"
        >
          <span className="text-[11px] text-neutral-400 group-hover:text-neutral-700 transition-colors">
            {showMore ? "Hide details" : "More details"}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-neutral-400 group-hover:text-neutral-700 transition-all duration-200 ${
              showMore ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </button>

        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{ maxHeight: showMore ? "120px" : "0px", opacity: showMore ? 1 : 0 }}
        >
          <div className="space-y-2.5 pt-1">
            <Row label="Detected from">
              <span className="text-[13px] text-neutral-700">{rec.detectedFromCount} transactions</span>
            </Row>
            <Row label="Confidence">
              <div className="flex items-center gap-2">
                <div className="h-1 w-14 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: showMore ? `${rec.confidence * 100}%` : "0%",
                      transition: "width 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                    }}
                  />
                </div>
                <span className="text-[11px] text-neutral-400 tabular-nums">
                  {Math.round(rec.confidence * 100)}%
                </span>
              </div>
            </Row>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-5 py-4 space-y-1.5">
        <Action icon={<Globe className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label={`Manage at ${rec.merchantName}`} />
        <Action icon={<History className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="View history" />
        <Action icon={<Tag className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Change category" />
        <Action icon={<BellOff className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Ignore recurring" />
        <Action
          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.75} />}
          label="Delete"
          danger
          onClick={() => {
            removeRecurring(rec.id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <div>{children}</div>
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
