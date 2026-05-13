"use client";

import { useState } from "react";
import { X, Building2, History, Tag, Repeat2, Trash2, ChevronDown } from "lucide-react";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { BucketDot } from "@/components/ui/bucket-dot";
import { formatCurrency } from "@/lib/calculations";
import { useSanity } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const BUCKET_LABELS: Record<string, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
  income: "Income",
  transfer: "Transfer",
  unknown: "Unknown",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "text-emerald-700 bg-emerald-50",
  pending: "text-amber-700 bg-amber-50",
  declined: "text-red-700 bg-red-50",
  cancelled: "text-neutral-500 bg-neutral-100",
};

interface TransactionDetailPanelProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetailPanel({ transaction: txn, onClose }: TransactionDetailPanelProps) {
  const { removeTransaction, data } = useSanity();
  const defaultCurrency = data.spendingPlan.currency;
  const [showMore, setShowMore] = useState(false);
  const date = new Date(txn.date);
  const dateStr = date.toLocaleDateString("en-SG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-[13px] font-medium text-neutral-500">Transaction</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center pt-9 pb-6 px-5 border-b border-neutral-100">
        <MerchantIcon name={txn.merchantName} size="xl" className="mb-5" />
        <h2 className="text-[15px] font-semibold text-neutral-900">{txn.merchantName}</h2>
        <p className="text-[12px] text-neutral-400 mt-1">
          {dateStr} · {timeStr}
        </p>
        <p className="text-[32px] font-semibold text-neutral-900 mt-5 tabular-nums leading-none">
          {formatCurrency(txn.amount, txn.currency, { defaultCurrency })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        <DetailRow label="Status">
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
              STATUS_STYLES[txn.status] ?? "text-neutral-500 bg-neutral-100"
            )}
          >
            {txn.status}
          </span>
        </DetailRow>

        <DetailRow label="Payment">
          <span className="text-[13px] text-neutral-700">
            {txn.accountName}
            {txn.accountLast4 ? ` ${txn.accountLast4}` : ""}
          </span>
        </DetailRow>

        {txn.categoryName && (
          <DetailRow label="Category">
            <span className="text-[13px] text-neutral-700">{txn.categoryName}</span>
          </DetailRow>
        )}

        <DetailRow label="Bucket">
          <BucketDot bucket={txn.bucket} showLabel size="sm" />
        </DetailRow>

        {txn.note && (
          <DetailRow label="Description">
            <span className="text-[13px] text-neutral-700 text-right max-w-[60%]">{txn.note}</span>
          </DetailRow>
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
          style={{
            maxHeight: showMore ? "200px" : "0px",
            opacity: showMore ? 1 : 0,
          }}
        >
          <div className="space-y-2.5 pt-1">
            <DetailRow label="Status">
              <span
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                  STATUS_STYLES[txn.status] ?? "text-neutral-500 bg-neutral-100"
                )}
              >
                {txn.status}
              </span>
            </DetailRow>
            <DetailRow label="Source">
              <span className="text-[13px] text-neutral-700 capitalize">{txn.source}</span>
            </DetailRow>
            <DetailRow label="Confidence">
              <div className="flex items-center gap-2">
                <div className="h-1 w-14 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: showMore ? `${txn.confidence * 100}%` : "0%",
                      transition: "width 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                    }}
                  />
                </div>
                <span className="text-[11px] text-neutral-400 tabular-nums">
                  {Math.round(txn.confidence * 100)}%
                </span>
              </div>
            </DetailRow>
          </div>
        </div>

        {txn.subtotal != null && (
          <div className="pt-3 mt-2 border-t border-neutral-100">
            <DetailRow label="Subtotal">
              <span className="text-[13px] tabular-nums text-neutral-700">
                {formatCurrency(txn.subtotal, txn.currency, { defaultCurrency })}
              </span>
            </DetailRow>
            <DetailRow label="Tax">
              <span className="text-[13px] tabular-nums text-neutral-700">
                {formatCurrency(txn.tax ?? 0, txn.currency, { defaultCurrency })}
              </span>
            </DetailRow>
            <DetailRow label="Total">
              <span className="text-[13px] tabular-nums font-semibold text-neutral-900">
                {formatCurrency(txn.amount, txn.currency, { defaultCurrency })}
              </span>
            </DetailRow>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 px-5 py-4 space-y-1.5">
        <ActionButton icon={<Building2 className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Contact business" />
        <ActionButton icon={<History className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="View merchant history" />
        <ActionButton icon={<Tag className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Edit category" />
        {!txn.recurringMerchantId && (
          <ActionButton icon={<Repeat2 className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Mark as recurring" />
        )}
        <ActionButton
          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.75} />}
          label="Delete"
          danger
          onClick={() => {
            removeTransaction(txn.id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ActionButton({
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
      <Caret />
    </button>
  );
}

function Caret() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
      <path
        d="M1 1l4 4-4 4"
        stroke="#d4d4d4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
