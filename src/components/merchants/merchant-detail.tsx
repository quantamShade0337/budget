"use client";

import { X, Globe, Tag, EyeOff } from "lucide-react";
import { MerchantIcon } from "@/components/ui/merchant-icon";
import { formatCurrency } from "@/lib/calculations";
import { useSanity } from "@/lib/store";
import type { Merchant } from "@/lib/types";

interface MerchantDetailPanelProps {
  merchant: Merchant;
  onClose: () => void;
}

export function MerchantDetailPanel({ merchant, onClose }: MerchantDetailPanelProps) {
  const { data } = useSanity();
  const merchantTxns = data.transactions
    .filter((t) => t.merchantId === merchant.id || t.merchantName === merchant.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-[13px] font-medium text-neutral-500">Merchant</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-9 pb-6 px-5 border-b border-neutral-100">
        <MerchantIcon name={merchant.name} size="xl" className="mb-5" />
        <h2 className="text-[15px] font-semibold text-neutral-900">{merchant.name}</h2>
        <p className="text-[32px] font-semibold text-neutral-900 mt-5 tabular-nums leading-none">
          {formatCurrency(merchant.totalSpent, merchant.currency)}
        </p>
        <p className="text-[12px] text-neutral-400 mt-1">
          {merchant.transactionCount} transaction{merchant.transactionCount !== 1 ? "s" : ""}
        </p>
      </div>

      {merchantTxns.length > 0 && (
        <div className="px-5 py-4 border-b border-neutral-100">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-3">
            Latest
          </p>
          <div className="space-y-0">
            {merchantTxns.map((txn, i) => (
              <div
                key={txn.id}
                className={`flex items-center justify-between py-2.5 ${
                  i < merchantTxns.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <p className="text-[13px] text-neutral-500 tabular-nums">
                  {new Date(txn.date).toLocaleDateString("en-SG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[13px] tabular-nums font-medium text-neutral-900">
                  {formatCurrency(txn.amount, txn.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-5 py-4 space-y-1.5">
        {merchant.website && (
          <Action icon={<Globe className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Visit website" />
        )}
        <Action icon={<Tag className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Change category" />
        <Action icon={<EyeOff className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Hide merchant" />
      </div>
    </div>
  );
}

function Action({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-50/60 hover:bg-neutral-100 transition-colors">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-[13px] text-neutral-700">{label}</span>
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
