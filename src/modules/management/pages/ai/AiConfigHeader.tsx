import type { ReactNode } from 'react';
import { Check, Cpu, Plus, RotateCcw, Search, Sparkles, Zap } from 'lucide-react';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = 'gray',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: 'gray' | 'green' | 'orange';
}) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-[#C2410C]',
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-lg font-extrabold tabular-nums leading-tight text-gray-900">
          {value} <span className="text-[11px] font-medium text-gray-400">{hint}</span>
        </p>
      </div>
    </div>
  );
}

export function AiConfigHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
          <Cpu className="size-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">AI Configuration</h1>
          <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
            Manage models, prompts and usage limits for every AI feature in the system
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
      >
        <Plus className="size-4" strokeWidth={2.5} /> New configuration
      </button>
    </div>
  );
}

export function AiConfigKpiStrip({
  total,
  active,
  chat,
  shownCount,
  isFetching,
}: {
  total: number;
  active: number;
  chat: number;
  shownCount: number;
  isFetching: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Kpi
        icon={<Sparkles className="size-4" />}
        label="Total configurations"
        value={String(total || '—')}
        hint={isFetching ? 'Refreshing…' : `${shownCount} on this page`}
      />
      <Kpi icon={<Check className="size-4" />} label="Active" value={String(active)} hint="Serving live traffic" tone="green" />
      <Kpi icon={<Zap className="size-4" />} label="Active chat models" value={String(chat)} hint="CHAT purpose" tone="orange" />
    </div>
  );
}

export function AiConfigFilterBar({
  search,
  provider,
  purpose,
  status,
  hasFilters,
  onSearchChange,
  onProviderChange,
  onPurposeChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  provider: string;
  purpose: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  hasFilters: boolean;
  onSearchChange: (val: string) => void;
  onProviderChange: (val: string) => void;
  onPurposeChange: (val: string) => void;
  onStatusChange: (val: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or model..."
            aria-label="Search AI configurations"
            role="searchbox"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <select value={provider} onChange={(e) => onProviderChange(e.target.value)} aria-label="Filter by provider" className={selectClass}>
            <option value="ALL">Provider: All</option>
            <option value="GEMINI">Gemini</option>
            <option value="OTHER">Other</option>
          </select>
          <select value={purpose} onChange={(e) => onPurposeChange(e.target.value)} aria-label="Filter by purpose" className={selectClass}>
            <option value="ALL">Purpose: All</option>
            <option value="CHAT">Chat</option>
            <option value="EMBEDDING">Embedding</option>
            <option value="OCR">OCR</option>
          </select>
          <select value={status} onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')} aria-label="Filter by status" className={selectClass}>
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">● Active</option>
            <option value="INACTIVE">○ Inactive</option>
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear filters"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
