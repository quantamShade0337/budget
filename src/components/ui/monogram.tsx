import { cn } from "@/lib/utils";
import type { MonogramConfig } from "@/lib/types";

interface MonogramProps {
  letter: string;
  config: MonogramConfig;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean;
}

const sizeMap = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-16 h-16 text-[22px]",
};

const emojiSizeMap = {
  xs: "text-[12px]",
  sm: "text-[14px]",
  md: "text-[18px]",
  lg: "text-[24px]",
  xl: "text-[32px]",
};

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function Monogram({ letter, config, size = "md", className, interactive }: MonogramProps) {
  const lightBg = isLightColor(config.bgColor);
  const fg = lightBg ? "#0a0a0a" : "#ffffff";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 select-none",
        sizeMap[size],
        interactive && "transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
      style={{ backgroundColor: config.bgColor, color: fg }}
    >
      {config.emoji ? (
        <span className={cn(emojiSizeMap[size], "leading-none")}>{config.emoji}</span>
      ) : (
        <span className="leading-none">{(letter || "?").toUpperCase()}</span>
      )}
    </div>
  );
}
