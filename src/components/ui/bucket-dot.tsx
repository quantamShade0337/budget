import { cn } from "@/lib/utils";
import type { TransactionBucket } from "@/lib/types";

const BUCKET_COLORS: Record<TransactionBucket, string> = {
  needs: "bg-blue-500",
  wants: "bg-violet-500",
  savings: "bg-emerald-500",
  income: "bg-emerald-600",
  transfer: "bg-neutral-400",
  unknown: "bg-neutral-300",
};

const BUCKET_LABELS: Record<TransactionBucket, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
  income: "Income",
  transfer: "Transfer",
  unknown: "Unknown",
};

interface BucketDotProps {
  bucket: TransactionBucket;
  className?: string;
  size?: "xs" | "sm";
  showLabel?: boolean;
}

export function BucketDot({ bucket, className, size = "sm", showLabel }: BucketDotProps) {
  const sizeClass = size === "xs" ? "w-1 h-1" : "w-1.5 h-1.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} title={BUCKET_LABELS[bucket]}>
      <span className={cn("rounded-full shrink-0", BUCKET_COLORS[bucket], sizeClass)} />
      {showLabel && (
        <span className="text-[11px] text-neutral-400">{BUCKET_LABELS[bucket]}</span>
      )}
    </span>
  );
}
