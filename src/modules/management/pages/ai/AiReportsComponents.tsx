import { AlertTriangle, Search } from 'lucide-react';
import type { AiReportStatus } from '../../types/admin';
import { cn } from '@/shared/lib/utils';
import { REPORT_TABS } from './reportConstants';

export function StatusCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value?: number;
  icon: typeof AlertTriangle;
  tone: 'red' | 'green' | 'gray';
  hint: string;
}) {
  const tones = {
    red: 'bg-[#fef2f2] text-[#b91c1c]',
    green: 'bg-[#ecfdf5] text-[#047857]',
    gray: 'bg-[#f1f5f9] text-[#555f6f]',
  };
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <span className={cn('flex size-10 items-center justify-center rounded-full', tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[13px] font-medium text-[#555f6f]">{label}</p>
        <p className="text-2xl font-bold leading-8 text-[#151c27]">
          {value === undefined ? '—' : value.toLocaleString('en-US')}
        </p>
        <p className="text-[11px] text-[#98a2b3]">{hint}</p>
      </div>
    </div>
  );
}

export function AiReportsFilterBar({
  search,
  status,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  status: AiReportStatus | '';
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AiReportStatus | '') => void;
  onClear: () => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
      <label
        className={cn(
          'flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3',
          'focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500',
        )}
      >
        <Search className="size-4 text-[#98a2b3]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Report ID, Student ID (MSSV), or Student Name"
          aria-label="Search reports"
          className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
        />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#555f6f]">Status:</span>
        <div role="tablist" aria-label="Report status" className="flex rounded-lg bg-[#f7f8fa] p-0.5">
          {REPORT_TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              onClick={() => onStatusChange(t.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                status === t.value ? 'bg-[#f37021] text-white' : 'text-[#555f6f] hover:text-[#151c27]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={!hasFilters}
        onClick={onClear}
        className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
      >
        Clear filters
      </button>
    </section>
  );
}
