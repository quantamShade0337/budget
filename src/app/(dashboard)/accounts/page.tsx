"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSanity } from "@/lib/store";
import { formatCurrency } from "@/lib/calculations";
import { useDetailPanel } from "@/components/ui/use-detail-panel";
import { AccountDetailPanel } from "@/components/accounts/account-detail";
import { AddAccountModal } from "@/components/accounts/add-account-modal";
import type { Account } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  savings: "Savings",
  current: "Current",
  debit: "Debit",
  credit: "Credit",
  cash: "Cash",
  wallet: "Wallet",
  investment: "Investment",
};

export default function AccountsPage() {
  const { data } = useSanity();
  const panel = useDetailPanel<Account>();
  const [addOpen, setAddOpen] = useState(false);

  const accounts = data.accounts;
  const defaultCurrency = data.spendingPlan.currency;

  // Re-derive selected from current data so balance changes propagate
  const liveSelected = panel.rendered
    ? accounts.find((a) => a.id === panel.rendered!.id) ?? null
    : null;

  const bankAccounts = accounts.filter((a) => ["savings", "current"].includes(a.type));
  const cards = accounts.filter((a) => ["debit", "credit"].includes(a.type));
  const wallets = accounts.filter((a) => ["wallet", "cash"].includes(a.type));
  const investments = accounts.filter((a) => a.type === "investment");

  const sections = [
    { label: "Bank accounts", accounts: bankAccounts },
    { label: "Cards", accounts: cards },
    { label: "Wallets & cash", accounts: wallets },
    { label: "Investments", accounts: investments },
  ].filter((s) => s.accounts.length > 0);

  return (
    <div className="flex h-full overflow-hidden" onClick={() => panel.close()}>
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold text-neutral-900">Accounts</h1>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddOpen(true);
            }}
            className="flex items-center gap-1 text-[13px] text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200/70 rounded-full px-3 py-1.5"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            Add account
          </button>
        </div>

        <div className="px-8 py-6 space-y-7">
          {accounts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[14px] font-medium text-neutral-900 mb-1">No accounts yet</p>
              <p className="text-[13px] text-neutral-500 mb-6 max-w-sm mx-auto">
                Add a bank account, card, wallet, or cash to start tracking.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-neutral-900 text-white rounded-full text-[13px] font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Add account
              </button>
            </div>
          ) : (
            sections.map(({ label, accounts: list }) => (
              <section key={label}>
                <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-3 px-1">
                  {label}
                </p>
                <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
                  {list.map((acc, i) => {
                    const available = Math.max(0, acc.currentBalance - acc.protectedBalance);
                    const isSelected = liveSelected?.id === acc.id;
                    const updated = new Date(acc.balanceUpdatedAt);
                    return (
                      <button
                        key={acc.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          panel.toggle(acc);
                        }}
                        style={{ animationDelay: `${i * 30}ms` }}
                        className={`group w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-50/80 transition-colors text-left animate-row-fade-in ${
                          isSelected ? "bg-neutral-50" : ""
                        } ${i < list.length - 1 ? "border-b border-neutral-100" : ""}`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-wide shrink-0"
                          style={{ backgroundColor: acc.color ?? "#0a0a0a" }}
                        >
                          {acc.bankName.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-neutral-900 leading-tight">
                            {acc.name}
                            {acc.last4 && (
                              <span className="text-neutral-400 font-normal ml-1">
                                •••• {acc.last4}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[12px] text-neutral-400">
                              {acc.bankName} · {TYPE_LABELS[acc.type]}
                            </p>
                            <span className="text-[11px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              · Updated{" "}
                              {updated.toLocaleDateString("en-SG", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[14px] font-medium tabular-nums text-neutral-900">
                            {formatCurrency(acc.currentBalance, acc.currency, { defaultCurrency })}
                          </p>
                          {acc.protectedBalance > 0 && (
                            <p className="text-[11px] tabular-nums text-neutral-400 mt-0.5">
                              {formatCurrency(available, acc.currency, { defaultCurrency })} available
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {liveSelected && (
        <div
          className={`w-[360px] shrink-0 border-l border-neutral-200/70 overflow-hidden ${
            panel.closing ? "animate-slide-out-right" : "animate-slide-in-right"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <AccountDetailPanel account={liveSelected} onClose={panel.close} />
        </div>
      )}

      {addOpen && <AddAccountModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
