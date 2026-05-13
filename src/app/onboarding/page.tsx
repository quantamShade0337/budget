"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useSanity, computeInitials, DEFAULT_MONOGRAM } from "@/lib/store";
import { SanityLogo } from "@/components/ui/sanity-logo";
import { formatCurrency } from "@/lib/calculations";
import type { AccountType, Currency } from "@/lib/types";

const STEPS = ["welcome", "profile", "account", "income", "done"] as const;
type Step = (typeof STEPS)[number];

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "savings", label: "Savings" },
  { value: "current", label: "Current" },
  { value: "debit", label: "Debit card" },
  { value: "credit", label: "Credit card" },
  { value: "wallet", label: "Wallet" },
  { value: "cash", label: "Cash" },
];

const CURRENCIES: Currency[] = ["SGD", "USD", "MYR", "GBP", "EUR"];

export default function OnboardingPage() {
  const router = useRouter();
  const sanity = useSanity();
  const [step, setStep] = useState<Step>("welcome");

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Account
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("savings");
  const [bankName, setBankName] = useState("");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState("");
  const [protectedAmount, setProtectedAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("SGD");

  // Income
  const [income, setIncome] = useState("");

  useEffect(() => {
    if (sanity.ready && sanity.data.onboarded) {
      router.replace("/home");
    }
  }, [sanity.ready, sanity.data.onboarded, router]);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const submitProfile = () => {
    if (!name.trim() || !email.trim()) return;
    sanity.setUser({
      id: "user_local",
      name: name.trim(),
      email: email.trim(),
      initials: computeInitials(name),
      monogram: DEFAULT_MONOGRAM,
    });
    goNext();
  };

  const submitAccount = () => {
    const bal = parseFloat(balance);
    const prot = parseFloat(protectedAmount || "0");
    if (!accountName.trim() || isNaN(bal)) return;
    sanity.addAccount({
      name: accountName.trim(),
      type: accountType,
      bankName: bankName.trim() || accountName.trim(),
      currency,
      currentBalance: bal,
      protectedBalance: isNaN(prot) ? 0 : prot,
      last4: last4.trim() || undefined,
      cardNetwork: accountType === "debit" || accountType === "credit" ? "visa" : undefined,
      color: "#0a0a0a",
    });
    goNext();
  };

  const submitIncome = () => {
    const n = parseFloat(income);
    if (isNaN(n)) return;
    sanity.setIncome(n);
    goNext();
  };

  const finish = () => {
    sanity.setOnboarded(true);
    router.replace("/home");
  };

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  if (!sanity.ready) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto w-full">
        <SanityLogo size="sm" />
        {step !== "welcome" && step !== "done" && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        )}
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 mb-12">
        <div className="h-[3px] bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md animate-fade-in">
          {step === "welcome" && (
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-3">
                Calm your money.
              </h1>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-10">
                Sanity tracks every transaction, subscription, and balance in one quiet place. Set
                up your accounts in under a minute.
              </p>
              <PrimaryButton onClick={goNext}>Get started</PrimaryButton>
              <p className="text-xs text-neutral-400 mt-4 text-center">
                Your data stays on this device.
              </p>
            </div>
          )}

          {step === "profile" && (
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
                What should we call you?
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                We use this for your profile and a friendlier dashboard.
              </p>

              <div className="space-y-4 mb-8">
                <Field label="Name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ethan Soh"
                    autoFocus
                    className={inputStyle}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputStyle}
                  />
                </Field>
              </div>

              <PrimaryButton onClick={submitProfile} disabled={!name.trim() || !email.trim()}>
                Continue
              </PrimaryButton>
            </div>
          )}

          {step === "account" && (
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
                Add your first account.
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                A bank account, card, or wallet. You can add more later.
              </p>

              <div className="space-y-4 mb-8">
                <Field label="Account name">
                  <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="POSB Savings"
                    autoFocus
                    className={inputStyle}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className={inputStyle}
                    >
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Currency">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className={inputStyle}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bank or issuer">
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="POSB"
                      className={inputStyle}
                    />
                  </Field>
                  <Field label={`Last 4 ${accountType.includes("card") || accountType === "debit" || accountType === "credit" ? "" : "(optional)"}`}>
                    <input
                      value={last4}
                      maxLength={4}
                      onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                      placeholder="2756"
                      className={inputStyle}
                    />
                  </Field>
                </div>

                <Field label={`Current balance (${currency})`}>
                  <input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    className={inputStyle + " tabular-nums"}
                  />
                </Field>

                <Field
                  label={`Protected balance (${currency})`}
                  hint="Keep at least this much. Excluded from safe-to-spend."
                >
                  <input
                    type="number"
                    step="0.01"
                    value={protectedAmount}
                    onChange={(e) => setProtectedAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputStyle + " tabular-nums"}
                  />
                </Field>
              </div>

              <PrimaryButton
                onClick={submitAccount}
                disabled={!accountName.trim() || !balance}
              >
                Continue
              </PrimaryButton>
            </div>
          )}

          {step === "income" && (
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
                Your monthly income.
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                We split it 60 / 20 / 20 — needs, wants, savings.
              </p>

              <div className="mb-8">
                <Field label={`Monthly income (${currency})`}>
                  <input
                    type="number"
                    step="0.01"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className={inputStyle + " tabular-nums text-lg"}
                  />
                </Field>

                {parseFloat(income) > 0 && (
                  <div className="mt-5 bg-white border border-neutral-200/70 rounded-xl p-4 animate-fade-in">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-[0.08em] mb-3">
                      Your monthly plan
                    </p>
                    <div className="space-y-2.5">
                      <SplitRow label="Needs" amount={parseFloat(income) * 0.6} pct={60} />
                      <SplitRow label="Wants" amount={parseFloat(income) * 0.2} pct={20} />
                      <SplitRow label="Savings" amount={parseFloat(income) * 0.2} pct={20} />
                    </div>
                  </div>
                )}
              </div>

              <PrimaryButton onClick={submitIncome} disabled={!income || parseFloat(income) <= 0}>
                Continue
              </PrimaryButton>
            </div>
          )}

          {step === "done" && (
            <div className="text-center pt-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-6 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
                You&apos;re set, {sanity.data.user?.name.split(" ")[0]}.
              </h1>
              <p className="text-sm text-neutral-500 mb-10 max-w-xs mx-auto">
                Your dashboard is ready. Add transactions, recurring subscriptions, and more from
                inside.
              </p>
              <PrimaryButton onClick={finish}>Open dashboard</PrimaryButton>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const inputStyle =
  "w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-600 mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="text-xs text-neutral-400 mt-1 block">{hint}</span>}
    </label>
  );
}

function SplitRow({ label, amount, pct }: { label: string; amount: number; pct: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-700">{label}</span>
        <span className="text-xs text-neutral-400">{pct}%</span>
      </div>
      <span className="text-sm tabular-nums text-neutral-900 font-medium">
        {formatCurrency(amount, "SGD")}
      </span>
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 group"
    >
      {children}
      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0" />
    </button>
  );
}
