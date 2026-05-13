import type { Account, Transaction, RecurringTransaction, SpendingPlan, SafeToSpendBreakdown } from "./types";

export function getSpendableFromAccounts(accounts: Account[]): number {
  return accounts.reduce((sum, acc) => {
    return sum + Math.max(0, acc.currentBalance - acc.protectedBalance);
  }, 0);
}

export function getTotalBalance(accounts: Account[]): number {
  const seen = new Set<string>();
  return accounts.reduce((sum, acc) => {
    // Deduplicate linked accounts (debit card linked to savings)
    const key = `${acc.bankName}_${acc.currentBalance}`;
    if (seen.has(key) && acc.type === "debit") return sum;
    seen.add(key);
    return sum + acc.currentBalance;
  }, 0);
}

export function getTotalProtected(accounts: Account[]): number {
  const seen = new Set<string>();
  return accounts.reduce((sum, acc) => {
    const key = `${acc.bankName}_${acc.currentBalance}`;
    if (seen.has(key) && acc.type === "debit") return sum;
    seen.add(key);
    return sum + acc.protectedBalance;
  }, 0);
}

export function getUpcomingRecurringTotal(
  recurring: RecurringTransaction[],
  withinDays = 30
): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return recurring
    .filter((r) => {
      if (!r.active) return false;
      const next = new Date(r.expectedNextDate);
      return next <= cutoff;
    })
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getMonthlyBucketSpend(
  transactions: Transaction[],
  bucket: "needs" | "wants" | "savings",
  year: number,
  month: number
): number {
  return transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() + 1 === month &&
        t.bucket === bucket &&
        t.status !== "declined" &&
        t.status !== "cancelled"
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateSafeToSpend(
  accounts: Account[],
  recurring: RecurringTransaction[],
  transactions: Transaction[],
  plan: SpendingPlan,
  year: number,
  month: number
): SafeToSpendBreakdown {
  const spendableFromAccounts = getSpendableFromAccounts(accounts);
  const upcomingRecurringTotal = getUpcomingRecurringTotal(recurring);

  const needsBudget = plan.monthlyIncome * (plan.needsPercent / 100);
  const savingsBudget = plan.monthlyIncome * (plan.savingsPercent / 100);

  const needsSpentSoFar = getMonthlyBucketSpend(transactions, "needs", year, month);
  const savingsDoneSoFar = getMonthlyBucketSpend(transactions, "savings", year, month);

  const remainingNeedsEstimate = Math.max(0, needsBudget - needsSpentSoFar);
  const remainingSavingsTarget = Math.max(0, savingsBudget - savingsDoneSoFar);

  const rawSafe =
    spendableFromAccounts -
    upcomingRecurringTotal -
    remainingNeedsEstimate -
    remainingSavingsTarget;

  const safeToSpend = Math.max(0, rawSafe);

  const belowProtected = spendableFromAccounts < upcomingRecurringTotal
    ? upcomingRecurringTotal - spendableFromAccounts
    : undefined;

  return {
    spendableFromAccounts,
    upcomingRecurringTotal,
    remainingNeedsEstimate,
    remainingSavingsTarget,
    safeToSpend,
    currency: plan.currency,
    belowProtectedAmount: belowProtected,
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  SGD: "$",
  USD: "$",
  MYR: "RM",
  GBP: "£",
  EUR: "€",
};

export function formatCurrency(
  amount: number,
  currency: string,
  options?: { compact?: boolean; showPlus?: boolean; defaultCurrency?: string }
): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...(options?.compact && absAmount >= 1000
      ? { notation: "compact", compactDisplay: "short" }
      : {}),
  }).format(absAmount);

  const prefix = options?.showPlus && amount > 0 ? "+" : amount < 0 ? "-" : "";

  // When currency matches the user's default, use a simple symbol (no code)
  if (options?.defaultCurrency && currency === options.defaultCurrency) {
    const sym = CURRENCY_SYMBOLS[currency] ?? "";
    return `${prefix}${sym}${formatted}`;
  }

  return `${prefix}${currency} ${formatted}`;
}

export function formatAmount(
  amount: number,
  currency: string,
  defaultCurrency: string,
  options?: { compact?: boolean; showPlus?: boolean }
): string {
  return formatCurrency(amount, currency, { ...options, defaultCurrency });
}

export function getBudgetProgress(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Math.min(100, (spent / budget) * 100);
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric",
  });
}
