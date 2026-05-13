export type Currency = "SGD" | "USD" | "MYR" | "GBP" | "EUR";

export type AccountType = "savings" | "current" | "debit" | "credit" | "cash" | "wallet" | "investment";

export type TransactionBucket = "needs" | "wants" | "savings" | "income" | "transfer" | "unknown";

export type TransactionStatus = "approved" | "pending" | "declined" | "cancelled";

export type RecurringInterval = "monthly" | "yearly" | "weekly" | "quarterly";

export type SourceType = "gmail" | "email" | "statement" | "manual";

export type SourceStatus = "connected" | "disconnected" | "error" | "syncing";

export interface MonogramConfig {
  bgColor: string;
  emoji?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  initials: string;
  monogram?: MonogramConfig;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName: string;
  cardNetwork?: "visa" | "mastercard" | "amex" | "local";
  last4?: string;
  currency: Currency;
  currentBalance: number;
  protectedBalance: number;
  balanceUpdatedAt: string;
  color?: string;
}

export interface BalanceSnapshot {
  id: string;
  accountId: string;
  amount: number;
  currency: Currency;
  note?: string;
  capturedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Merchant {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  logoUrl?: string;
  website?: string;
  categoryId?: string;
  defaultBucket: TransactionBucket;
  totalSpent: number;
  transactionCount: number;
  lastTransactionDate: string;
  currency: Currency;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  accountName: string;
  accountLast4?: string;
  merchantId: string;
  merchantName: string;
  rawDescription: string;
  amount: number;
  currency: Currency;
  date: string;
  categoryId?: string;
  categoryName?: string;
  bucket: TransactionBucket;
  source: string;
  status: TransactionStatus;
  confidence: number;
  verified: boolean;
  recurringMerchantId?: string;
  subtotal?: number;
  tax?: number;
  note?: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  merchantId: string;
  merchantName: string;
  accountId: string;
  accountName: string;
  accountLast4?: string;
  name: string;
  amount: number;
  currency: Currency;
  interval: RecurringInterval;
  expectedNextDate: string;
  active: boolean;
  confidence: number;
  detectedFromCount: number;
  categoryName?: string;
  bucket: TransactionBucket;
}

export interface SpendingPlan {
  id: string;
  userId: string;
  monthlyIncome: number;
  currency: Currency;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

export interface SourceConnection {
  id: string;
  userId: string;
  type: SourceType;
  label: string;
  status: SourceStatus;
  lastSyncedAt?: string;
  transactionsFound: number;
  watchedSenders?: string[];
  metadata?: Record<string, string>;
}

export interface SafeToSpendBreakdown {
  spendableFromAccounts: number;
  upcomingRecurringTotal: number;
  remainingNeedsEstimate: number;
  remainingSavingsTarget: number;
  safeToSpend: number;
  currency: Currency;
  belowProtectedAmount?: number;
}

export interface MonthlySpending {
  month: string;
  needsSpent: number;
  wantsSpent: number;
  savingsAmount: number;
  incomeReceived: number;
  currency: Currency;
}
