"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Activity,
  RotateCcw,
  Landmark,
  Store,
  PieChart,
  Plug,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { SanityLogo } from "@/components/ui/sanity-logo";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Recurring", href: "/recurring", icon: RotateCcw },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Merchants", href: "/merchants", icon: Store },
  { label: "Plan", href: "/plan", icon: PieChart },
  { label: "Sources", href: "/sources", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-[#fafafa] border-r border-neutral-200/60">
      {/* Logo */}
      <div className="px-5 pt-6 pb-6">
        <SanityLogo size="sm" />
      </div>

      {/* User */}
      {user && (
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-[13px] font-medium text-neutral-700 shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-neutral-900 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-px">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] transition-colors",
                active
                  ? "bg-white text-neutral-900 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)]"
                  : "text-neutral-500 hover:bg-white/60 hover:text-neutral-900"
              )}
            >
              <Icon
                className={cn(
                  "w-[15px] h-[15px] shrink-0",
                  active ? "text-neutral-800" : "text-neutral-400"
                )}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 mt-2">
        <button className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors mb-3">
          <HelpCircle className="w-3 h-3" strokeWidth={1.75} />
          Help
        </button>
        <div className="flex gap-3">
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
  );
}
