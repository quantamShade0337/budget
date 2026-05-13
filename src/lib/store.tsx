"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type {
  Account,
  Transaction,
  RecurringTransaction,
  Merchant,
  SpendingPlan,
  SourceConnection,
  User,
  MonogramConfig,
} from "./types";

export const DEFAULT_MONOGRAM: MonogramConfig = { bgColor: "#16a34a" };

export interface SanityData {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  recurring: RecurringTransaction[];
  merchants: Merchant[];
  spendingPlan: SpendingPlan;
  sources: SourceConnection[];
  onboarded: boolean;
  version: number;
}

const DATA_VERSION = 1;
const STORAGE_KEY = "sanity:data:v1";

const DEFAULT_DATA: SanityData = {
  user: null,
  accounts: [],
  transactions: [],
  recurring: [],
  merchants: [],
  spendingPlan: {
    id: "plan_default",
    userId: "user_default",
    monthlyIncome: 0,
    currency: "SGD",
    needsPercent: 60,
    wantsPercent: 20,
    savingsPercent: 20,
  },
  sources: [],
  onboarded: false,
  version: DATA_VERSION,
};

interface SanityContextValue {
  data: SanityData;
  ready: boolean;
  setUser: (u: User) => void;
  setMonogram: (m: MonogramConfig) => void;
  addAccount: (a: Omit<Account, "id" | "userId" | "balanceUpdatedAt">) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id" | "userId">) => Transaction;
  removeTransaction: (id: string) => void;
  addRecurring: (r: Omit<RecurringTransaction, "id" | "userId">) => RecurringTransaction;
  removeRecurring: (id: string) => void;
  upsertMerchant: (m: Omit<Merchant, "id" | "userId">) => Merchant;
  setIncome: (income: number) => void;
  addSource: (s: Omit<SourceConnection, "id" | "userId">) => SourceConnection;
  removeSource: (id: string) => void;
  setOnboarded: (b: boolean) => void;
  reset: () => void;
}

const SanityContext = createContext<SanityContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function SanityProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SanityData>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let storedData: SanityData | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SanityData;
        if (parsed.version === DATA_VERSION) {
          storedData = { ...DEFAULT_DATA, ...parsed };
        }
      }
    } catch {}

    queueMicrotask(() => {
      if (storedData) setData(storedData);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data, ready]);

  const setUser = useCallback((u: User) => {
    setData((d) => ({
      ...d,
      user: { ...u, monogram: u.monogram ?? DEFAULT_MONOGRAM },
    }));
  }, []);

  const setMonogram = useCallback((m: MonogramConfig) => {
    setData((d) => (d.user ? { ...d, user: { ...d.user, monogram: m } } : d));
  }, []);

  const addAccount = useCallback<SanityContextValue["addAccount"]>((a) => {
    const next: Account = {
      ...a,
      id: uid("acc"),
      userId: "local",
      balanceUpdatedAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, accounts: [...d.accounts, next] }));
    return next;
  }, []);

  const updateAccount = useCallback<SanityContextValue["updateAccount"]>((id, patch) => {
    setData((d) => ({
      ...d,
      accounts: d.accounts.map((acc) =>
        acc.id === id
          ? { ...acc, ...patch, balanceUpdatedAt: new Date().toISOString() }
          : acc
      ),
    }));
  }, []);

  const removeAccount = useCallback((id: string) => {
    setData((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) }));
  }, []);

  const upsertMerchant = useCallback<SanityContextValue["upsertMerchant"]>((m) => {
    let result!: Merchant;
    setData((d) => {
      const existing = d.merchants.find(
        (x) => x.normalizedName.toLowerCase() === m.normalizedName.toLowerCase()
      );
      if (existing) {
        result = existing;
        return d;
      }
      const next: Merchant = { ...m, id: uid("merch"), userId: "local" };
      result = next;
      return { ...d, merchants: [...d.merchants, next] };
    });
    return result;
  }, []);

  const addTransaction = useCallback<SanityContextValue["addTransaction"]>((t) => {
    const next: Transaction = { ...t, id: uid("txn"), userId: "local" };
    setData((d) => ({ ...d, transactions: [next, ...d.transactions] }));
    return next;
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, []);

  const addRecurring = useCallback<SanityContextValue["addRecurring"]>((r) => {
    const next: RecurringTransaction = { ...r, id: uid("rec"), userId: "local" };
    setData((d) => ({ ...d, recurring: [...d.recurring, next] }));
    return next;
  }, []);

  const removeRecurring = useCallback((id: string) => {
    setData((d) => ({ ...d, recurring: d.recurring.filter((r) => r.id !== id) }));
  }, []);

  const setIncome = useCallback((income: number) => {
    setData((d) => ({ ...d, spendingPlan: { ...d.spendingPlan, monthlyIncome: income } }));
  }, []);

  const addSource = useCallback<SanityContextValue["addSource"]>((s) => {
    const next: SourceConnection = { ...s, id: uid("src"), userId: "local" };
    setData((d) => ({ ...d, sources: [...d.sources, next] }));
    return next;
  }, []);

  const removeSource = useCallback((id: string) => {
    setData((d) => ({ ...d, sources: d.sources.filter((s) => s.id !== id) }));
  }, []);

  const setOnboarded = useCallback((b: boolean) => {
    setData((d) => ({ ...d, onboarded: b }));
  }, []);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo<SanityContextValue>(
    () => ({
      data,
      ready,
      setUser,
      setMonogram,
      addAccount,
      updateAccount,
      removeAccount,
      addTransaction,
      removeTransaction,
      addRecurring,
      removeRecurring,
      upsertMerchant,
      setIncome,
      addSource,
      removeSource,
      setOnboarded,
      reset,
    }),
    [
      data,
      ready,
      setUser,
      setMonogram,
      addAccount,
      updateAccount,
      removeAccount,
      addTransaction,
      removeTransaction,
      addRecurring,
      removeRecurring,
      upsertMerchant,
      setIncome,
      addSource,
      removeSource,
      setOnboarded,
      reset,
    ]
  );

  return <SanityContext.Provider value={value}>{children}</SanityContext.Provider>;
}

export function useSanity() {
  const ctx = useContext(SanityContext);
  if (!ctx) throw new Error("useSanity must be used inside SanityProvider");
  return ctx;
}

export function computeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
