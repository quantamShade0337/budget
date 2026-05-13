"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Monogram } from "./monogram";
import { AnimatedButton } from "./animated-button";
import type { MonogramConfig } from "@/lib/types";

const COLORS = [
  "#16a34a", "#22c55e", "#84cc16", "#14b8a6", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#ef4444", "#f97316", "#eab308", "#facc15",
  "#a16207", "#78716c", "#525252", "#262626", "#0a0a0a",
];

const EMOJIS = [
  "😀", "😎", "🤓", "🥳", "🤖", "👻", "🎭", "🦊",
  "🐱", "🐯", "🦁", "🐼", "🐧", "🦋", "🐳", "🦄",
  "🌟", "✨", "🚀", "💫", "🔥", "⚡", "🌈", "☀️",
  "🌙", "⭐", "🍀", "🌸", "🌻", "🌺", "🌹", "🌿",
  "🎯", "🎨", "🎵", "📚", "💡", "💎", "🏆", "🎁",
  "☕", "🍵", "🍩", "🍕", "🍔", "🍎", "🥑", "🌮",
];

type Tab = "color" | "emoji";

interface MonogramPickerProps {
  initialConfig: MonogramConfig;
  letter: string;
  onSave: (config: MonogramConfig) => void;
  onClose: () => void;
}

export function MonogramPicker({ initialConfig, letter, onSave, onClose }: MonogramPickerProps) {
  const [config, setConfig] = useState<MonogramConfig>(initialConfig);
  const [tab, setTab] = useState<Tab>(initialConfig.emoji ? "emoji" : "color");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[13px] font-medium text-neutral-500">Monogram</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center pt-3 pb-5">
          <div key={`${config.bgColor}-${config.emoji ?? letter}`} className="animate-scale-in">
            <Monogram letter={letter} config={config} size="xl" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-5 border-b border-neutral-100">
          <Tab active={tab === "color"} onClick={() => setTab("color")}>
            Color
          </Tab>
          <Tab active={tab === "emoji"} onClick={() => setTab("emoji")}>
            Emoji
          </Tab>
          {config.emoji && (
            <button
              onClick={() => setConfig({ ...config, emoji: undefined })}
              className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors py-2"
            >
              Use letter
            </button>
          )}
        </div>

        {/* Picker */}
        <div className="px-5 py-5 max-h-[280px] overflow-y-auto">
          {tab === "color" ? (
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {COLORS.map((color) => {
                const selected = config.bgColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, bgColor: color })}
                    className="relative w-10 h-10 rounded-full transition-transform duration-150 hover:scale-110 active:scale-95"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center animate-scale-in">
                        <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-1.5">
              {EMOJIS.map((emoji) => {
                const selected = config.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={() => setConfig({ ...config, emoji })}
                    className={`w-11 h-11 rounded-lg text-xl transition-all hover:bg-neutral-100 active:scale-95 ${
                      selected ? "bg-neutral-100 ring-1 ring-neutral-300" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="px-5 pb-5">
          <AnimatedButton
            onClick={() => onSave(config)}
            onSuccess={onClose}
            className="w-full"
          >
            Confirm
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors -mb-[1px] ${
        active ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
