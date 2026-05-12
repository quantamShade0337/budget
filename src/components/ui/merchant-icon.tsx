import { cn } from "@/lib/utils";

const MERCHANT_COLORS: Record<string, { bg: string; text: string; symbol?: string }> = {
  vercel: { bg: "#000000", text: "#ffffff", symbol: "▲" },
  openai: { bg: "#10a37f", text: "#ffffff" },
  anthropic: { bg: "#cc785c", text: "#ffffff" },
  grab: { bg: "#00b14f", text: "#ffffff" },
  grabfood: { bg: "#00b14f", text: "#ffffff" },
  apple: { bg: "#555555", text: "#ffffff" },
  "ntuc fairprice": { bg: "#e31837", text: "#ffffff" },
  singtel: { bg: "#e31837", text: "#ffffff" },
  posb: { bg: "#dc2626", text: "#ffffff" },
  dbs: { bg: "#dc2626", text: "#ffffff" },
  visa: { bg: "#1a1f71", text: "#ffffff" },
};

interface MerchantIconProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function MerchantIcon({ name, size = "md", className }: MerchantIconProps) {
  const key = name.toLowerCase();
  const config = MERCHANT_COLORS[key];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (config) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center font-semibold shrink-0",
          sizeMap[size],
          className
        )}
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {config.symbol ? (
          <span className={size === "xl" ? "text-2xl" : size === "lg" ? "text-lg" : "text-sm"}>
            {config.symbol}
          </span>
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }

  // Generic fallback with deterministic color from name hash
  const colors = [
    { bg: "#e0e7ff", text: "#4338ca" },
    { bg: "#fce7f3", text: "#be185d" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fef3c7", text: "#92400e" },
    { bg: "#dbeafe", text: "#1e40af" },
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#fee2e2", text: "#991b1b" },
    { bg: "#f0fdf4", text: "#166534" },
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const { bg, text } = colors[idx];

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-semibold shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      {initials}
    </div>
  );
}
