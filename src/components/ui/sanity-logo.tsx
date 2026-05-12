import { cn } from "@/lib/utils";

interface SanityLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { mark: "w-4 h-4", text: "text-sm" },
  md: { mark: "w-5 h-5", text: "text-[15px]" },
  lg: { mark: "w-7 h-7", text: "text-lg" },
};

export function SanityLogo({ size = "md", showText = true, className }: SanityLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-[5px] bg-neutral-900 relative flex items-center justify-center",
          s.mark
        )}
      >
        <div
          className="absolute bg-white rounded-full"
          style={{ width: "30%", height: "30%" }}
        />
      </div>
      {showText && (
        <span className={cn("font-semibold text-neutral-900 tracking-tight", s.text)}>
          Sanity
        </span>
      )}
    </div>
  );
}
