"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";
type State = "idle" | "loading" | "success";

interface AnimatedButtonProps {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  successDuration?: number;
  onSuccess?: () => void;
  type?: "button" | "submit";
}

const variantClasses: Record<Variant, { base: string; hover: string; success: string }> = {
  primary: {
    base: "bg-neutral-900 text-white",
    hover: "hover:bg-neutral-800",
    success: "bg-emerald-500 text-white",
  },
  secondary: {
    base: "bg-white border border-neutral-200 text-neutral-700",
    hover: "hover:bg-neutral-50",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  danger: {
    base: "bg-red-500 text-white",
    hover: "hover:bg-red-600",
    success: "bg-emerald-500 text-white",
  },
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
};

export function AnimatedButton({
  onClick,
  children,
  disabled,
  variant = "primary",
  size = "md",
  className,
  successDuration = 750,
  onSuccess,
  type = "button",
}: AnimatedButtonProps) {
  const [state, setState] = useState<State>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = async () => {
    if (state !== "idle" || disabled) return;
    setState("loading");
    try {
      await Promise.resolve(onClick());
      // Brief minimum loading time so the spinner doesn't flicker
      await new Promise((r) => setTimeout(r, 180));
      if (!mountedRef.current) return;
      setState("success");
      setTimeout(() => {
        onSuccess?.();
        if (mountedRef.current) setState("idle");
      }, successDuration);
    } catch {
      if (mountedRef.current) setState("idle");
    }
  };

  const v = variantClasses[variant];
  const showSuccessColor = state === "success";

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || state !== "idle"}
      className={cn(
        "relative rounded-full font-medium flex items-center justify-center gap-1.5 overflow-hidden",
        "transition-all duration-200 ease-out",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed",
        showSuccessColor ? v.success : `${v.base} ${state === "idle" ? v.hover : ""}`,
        state === "idle" && disabled && "opacity-30",
        sizeClasses[size],
        className
      )}
    >
      {/* Idle label */}
      <span
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200",
          state !== "idle" && "opacity-0 -translate-y-1"
        )}
      >
        {children}
      </span>

      {/* Loading spinner */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-150",
          state === "loading" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>

      {/* Success check */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          state === "success" ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
        )}
      >
        <Check className="w-4 h-4 animate-check-pop" strokeWidth={3} />
      </span>
    </button>
  );
}
