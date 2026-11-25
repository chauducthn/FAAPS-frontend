import type { ReactNode } from 'react';
import {
  Archive,
  FileWarning,
  Plus,
  RotateCcw,
  ScrollText,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';
import { POLICY_TYPES } from '../../../academic/validations/academic-rule.schema';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/20';

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
    orange: 'bg-orange-100 text-[#B45309]',
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

export function AcademicRulesHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#F37021] text-white">
          <ScrollText className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Academic Rules</h1>
          <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
            System-wide policies the platform enforces for students — GPA warnings, credit caps, attendance gates
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F37021] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#D9601A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F37021]/50"
      >
        <Plus className="size-4" strokeWidth={2.5} /> Create Rule
      </button>
    </div>
  );
}

export function AcademicRulesKpiStrip({
  totalItems,
  isFetching,
  pageIndex,
  totalPages,
  activeCount,
  shownCount,
  draftCount,
}: {
  totalItems: number;
  isFetching: boolean;
  pageIndex: number;
  totalPages: number;
  activeCount: number;
  shownCount: number;
  draftCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Kpi
        icon={<ShieldCheck className="size-4" />}
        label="Total rules"
        value={String(totalItems || '—')}
        hint={isFetching ? 'Refreshing…' : `Page ${pageIndex + 1} of ${Math.max(1, totalPages)}`}
      />
      <Kpi
        icon={<FileWarning className="size-4" />}
        label="Published (Active)"
        value={String(activeCount)}
        hint={`${shownCount} shown`}
        tone="green"
      />
      <Kpi
        icon={<Archive className="size-4" />}
        label="Drafts on this page"
        value={String(draftCount)}
        hint="Ready to publish"
        tone="orange"
      />
    </div>
  );
}

export function AcademicRulesFilterBar({
  search,
  policyType,
  status,
  hasFilters,
  onSearchChange,
  onPolicyTypeChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  policyType: string;
  status: 'ALL' | AcademicRuleStatus;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onPolicyTypeChange: (value: string) => void;
  onStatusChange: (value: 'ALL' | AcademicRuleStatus) => void;
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
            placeholder="Search by rule name, policy type, description…"
            aria-label="Search academic rules"
            role="searchbox"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F37021] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F37021]/20"
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
          <select
            value={policyType}
            onChange={(e) => onPolicyTypeChange(e.target.value)}
            aria-label="Filter by policy type"
            className={selectClass}
          >
            <option value="ALL">Type: All</option>
            {POLICY_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'ALL' | AcademicRuleStatus)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="ALL">Status: All</option>
            <option value="DRAFT">● Draft</option>
            <option value="ACTIVE">● Active</option>
            <option value="INACTIVE">○ Inactive</option>
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear filters"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F37021] hover:text-[#D9601A]"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
