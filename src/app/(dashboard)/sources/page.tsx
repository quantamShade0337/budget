"use client";

import { useState } from "react";
import { X, Plug, RefreshCw, Mail, FileText, Settings, Plus } from "lucide-react";
import { useSanity } from "@/lib/store";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useDetailPanel } from "@/components/ui/use-detail-panel";
import type { SourceConnection, SourceType } from "@/lib/types";

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  gmail: <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />,
  email: <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />,
  statement: <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />,
  manual: <Settings className="w-3.5 h-3.5" strokeWidth={1.75} />,
};

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  connected: { dot: "bg-emerald-500", label: "Connected" },
  disconnected: { dot: "bg-neutral-300", label: "Disconnected" },
  error: { dot: "bg-red-500", label: "Error" },
  syncing: { dot: "bg-blue-500", label: "Syncing" },
};

function ConnectModal({
  type,
  defaultLabel,
  onClose,
}: {
  type: SourceType;
  defaultLabel: string;
  onClose: () => void;
}) {
  const { addSource } = useSanity();
  const [label, setLabel] = useState(defaultLabel);
  const submit = () => {
    if (!label.trim()) return;
    addSource({
      type,
      label: label.trim(),
      status: "connected",
      lastSyncedAt: new Date().toISOString(),
      transactionsFound: 0,
      watchedSenders: type === "gmail" ? ["noreply@*", "receipts@*", "billing@*"] : undefined,
    });
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-neutral-900">Connect {type}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 pb-5">
          <label className="block">
            <span className="text-[11px] font-medium text-neutral-500 mb-1 block">Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5"
              autoFocus
            />
          </label>
        </div>
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] text-neutral-700 rounded-full border border-neutral-200 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <AnimatedButton
            onClick={submit}
            disabled={!label.trim()}
            size="sm"
            onSuccess={onClose}
          >
            Connect
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

function SourceDetailPanel({
  source,
  onClose,
}: {
  source: SourceConnection;
  onClose: () => void;
}) {
  const { removeSource } = useSanity();
  const status = STATUS_STYLES[source.status];
  const lastSync = source.lastSyncedAt
    ? new Date(source.lastSyncedAt).toLocaleDateString("en-SG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <span className="text-[13px] font-medium text-neutral-500">Source</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-9 pb-6 px-5 border-b border-neutral-100">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 mb-4">
          {SOURCE_ICONS[source.type] ?? <Plug className="w-4 h-4" strokeWidth={1.75} />}
        </div>
        <h2 className="text-[14px] font-semibold text-neutral-900 text-center">{source.label}</h2>
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-[11px] text-neutral-500">{status.label}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2.5 mb-5">
          <Row label="Last synced">
            <span className="text-[13px] text-neutral-700">{lastSync}</span>
          </Row>
          <Row label="Transactions found">
            <span className="text-[13px] text-neutral-700 tabular-nums">
              {source.transactionsFound}
            </span>
          </Row>
        </div>

        {source.watchedSenders && source.watchedSenders.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-2">
              Watched senders
            </p>
            <div className="space-y-1">
              {source.watchedSenders.map((s) => (
                <p
                  key={s}
                  className="text-[11px] text-neutral-700 bg-neutral-50/80 border border-neutral-100 rounded-md px-3 py-1.5 font-mono"
                >
                  {s}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 px-5 py-4 space-y-1.5">
        <Action icon={<RefreshCw className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Sync now" />
        <Action icon={<Settings className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.75} />} label="Manage senders" />
        <Action
          icon={<Plug className="w-3.5 h-3.5 text-red-500" strokeWidth={1.75} />}
          label="Disconnect"
          danger
          onClick={() => {
            removeSource(source.id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Action({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-50/60 hover:bg-neutral-100 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={`text-[13px] ${danger ? "text-red-500" : "text-neutral-700"}`}>{label}</span>
      </div>
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
        <path
          d="M1 1l4 4-4 4"
          stroke="#d4d4d4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function SourcesPage() {
  const { data } = useSanity();
  const panel = useDetailPanel<SourceConnection>();
  const [connectType, setConnectType] = useState<SourceType | null>(null);

  const liveSelected = panel.rendered
    ? data.sources.find((s) => s.id === panel.rendered!.id) ?? null
    : null;

  return (
    <div className="flex h-full overflow-hidden" onClick={() => panel.close()}>
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4">
          <h1 className="text-[15px] font-semibold text-neutral-900">Sources</h1>
        </div>

        <div className="px-8 py-6 space-y-6">
          <p className="text-[13px] text-neutral-500 max-w-md">
            Connect sources to import transactions automatically. Your data stays on this device.
          </p>

          {data.sources.length > 0 && (
            <div className="bg-white border border-neutral-200/70 rounded-xl overflow-hidden">
              {data.sources.map((src, i) => {
                const status = STATUS_STYLES[src.status];
                const isSelected = liveSelected?.id === src.id;
                return (
                  <button
                    key={src.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      panel.toggle(src);
                    }}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/80 transition-colors text-left animate-row-fade-in ${
                      isSelected ? "bg-neutral-50" : ""
                    } ${i < data.sources.length - 1 ? "border-b border-neutral-100" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                      {SOURCE_ICONS[src.type] ?? <Plug className="w-3.5 h-3.5" strokeWidth={1.75} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-neutral-900 truncate leading-tight">
                        {src.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span className="text-[11px] text-neutral-400">{status.label}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-medium text-neutral-700 tabular-nums">
                        {src.transactionsFound}
                      </p>
                      <p className="text-[11px] text-neutral-400">transactions</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.08em] mb-3 px-1">
              Connect new
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { type: "gmail" as SourceType, label: "Gmail", icon: <Mail className="w-4 h-4" strokeWidth={1.75} /> },
                {
                  type: "statement" as SourceType,
                  label: "Statement file",
                  icon: <FileText className="w-4 h-4" strokeWidth={1.75} />,
                },
              ].map((s) => (
                <button
                  key={s.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConnectType(s.type);
                  }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-200/70 hover:bg-neutral-50/70 hover:border-neutral-300 transition-all"
                >
                  <span className="text-neutral-500">{s.icon}</span>
                  <span className="text-[13px] font-medium text-neutral-700">{s.label}</span>
                  <Plus className="w-3 h-3 text-neutral-400 ml-auto" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {liveSelected && (
        <div
          className={`w-[360px] shrink-0 border-l border-neutral-200/70 overflow-hidden ${
            panel.closing ? "animate-slide-out-right" : "animate-slide-in-right"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <SourceDetailPanel source={liveSelected} onClose={panel.close} />
        </div>
      )}

      {connectType && (
        <ConnectModal
          type={connectType}
          defaultLabel={
            connectType === "gmail" ? "Gmail — primary" : "Statement upload"
          }
          onClose={() => setConnectType(null)}
        />
      )}
    </div>
  );
}
