"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Activity,
  RotateCcw,
  Landmark,
  PieChart,
  Settings,
  HelpCircle,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { SanityLogo } from "@/components/ui/sanity-logo";
import { Monogram } from "@/components/ui/monogram";
import { MonogramPicker } from "@/components/ui/monogram-picker";
import { useSanity, DEFAULT_MONOGRAM } from "@/lib/store";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Recurring", href: "/recurring", icon: RotateCcw },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Plan", href: "/plan", icon: PieChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { setMonogram } = useSanity();
  const [picking, setPicking] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ top: number; height: number; visible: boolean }>({
    top: 0,
    height: 0,
    visible: false,
  });

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      setIndicator((s) => ({ ...s, visible: false }));
      return;
    }
    setIndicator({
      top: active.offsetTop,
      height: active.offsetHeight,
      visible: true,
    });
  }, [pathname]);

  const letter = user?.name?.[0] ?? "?";
  const config = user?.monogram ?? DEFAULT_MONOGRAM;

  return (
    <>
      <aside className="w-[220px] shrink-0 flex flex-col h-full bg-[#fafafa] border-r border-neutral-200/60">
        <div className="px-5 pt-6 pb-6">
          <SanityLogo size="sm" />
        </div>

        {user && (
          <div className="px-4 pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPicking(true)}
                className="relative group shrink-0"
                aria-label="Edit monogram"
              >
                <Monogram letter={letter} config={config} size="md" interactive />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white border border-neutral-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <Pencil className="w-2 h-2 text-neutral-500" strokeWidth={2.5} />
                </span>
              </button>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-neutral-900 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav
          ref={navRef}
          className="flex-1 px-2 space-y-px relative"
        >
          {/* Sliding active indicator */}
          <span
            className="absolute left-0 w-[2px] bg-neutral-900 rounded-r-sm pointer-events-none"
            style={{
              top: indicator.top + 4,
              height: indicator.height - 8,
              opacity: indicator.visible ? 1 : 0,
              transition:
                "top 240ms cubic-bezier(0.2, 0.8, 0.2, 1), height 240ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms",
            }}
          />

          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                data-active={active}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] transition-all duration-150",
                  active
                    ? "bg-white text-neutral-900 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)]"
                    : "text-neutral-500 hover:bg-white/60 hover:text-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-[15px] h-[15px] shrink-0 transition-colors",
                    active ? "text-neutral-800" : "text-neutral-400"
                  )}
                  strokeWidth={1.75}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — collapsed by default, expand on click */}
        <div className="px-4 pb-5 pt-3 mt-2">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors">
              <HelpCircle className="w-3 h-3" strokeWidth={1.75} />
              Help
            </button>
            <button
              onClick={() => setShowLegal((s) => !s)}
              className={cn(
                "p-1 rounded-md text-neutral-300 hover:text-neutral-600 hover:bg-white/60 transition-colors",
                showLegal && "text-neutral-700"
              )}
              aria-label="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <div
            className="flex gap-3 overflow-hidden transition-all duration-200"
            style={{
              maxHeight: showLegal ? "32px" : "0px",
              opacity: showLegal ? 1 : 0,
              marginTop: showLegal ? 10 : 0,
            }}
          >
            {["Terms", "Privacy", "Cookies"].map((t) => (
              <span
                key={t}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {picking && (
        <MonogramPicker
          initialConfig={config}
          letter={letter}
          onSave={setMonogram}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}
