import { CheckCircle as CheckCircle2, CaretDown as ChevronDown, SpinnerGap as Loader2, MagnifyingGlass as Search, Sparkle as Sparkles, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { SmartBatchAssignResult } from '../types/admin';

export type PoolFilter = 'all' | 'ready' | 'missing';
const SELECT_CLS = 'h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-[#F26F21] focus:outline-none';

export function CohortPickerFilters({
  search, majorFilter, cohortFilter, poolFilter, majors, cohortVersions,
  onSearch, onMajor, onCohort, onPoolFilter,
}: {
  search: string; majorFilter: string; cohortFilter: string; poolFilter: PoolFilter;
  majors: string[]; cohortVersions: string[];
  onSearch: (v: string) => void; onMajor: (v: string) => void;
  onCohort: (v: string) => void; onPoolFilter: (v: PoolFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search major or cohort (e.g. SE K19)…" className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none" />
      </div>
      {majors.length > 1 && (
        <div className="relative">
          <select aria-label="Filter by major" value={majorFilter} onChange={(e) => onMajor(e.target.value)} className={SELECT_CLS}>
            <option value="">All majors ({majors.length})</option>
            {majors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      )}
      {cohortVersions.length > 1 && (
        <div className="relative">
          <select aria-label="Filter by cohort" value={cohortFilter} onChange={(e) => onCohort(e.target.value)} className={SELECT_CLS}>
            <option value="">All cohorts</option>
            {cohortVersions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      )}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold">
        {([['all', 'All'], ['ready', 'Ready'], ['missing', 'Not set']] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => onPoolFilter(key)} className={cn('rounded-md px-2.5 py-1 transition-colors', poolFilter === key ? 'bg-white text-[#C2410C] shadow-2xs' : 'text-gray-600 hover:text-gray-900')}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  waitingCount: number;
  unassignedTotal: number;
  readyCount: number;
  idleAdvisorCount: number;
  filteredCount: number;
  allowOverLimit: boolean;
  isPending: boolean;
  result: SmartBatchAssignResult | null;
  error: string | null;
  onToggleOverLimit: (next: boolean) => void;
  onRunSmartSetupAndAssign: () => void;
  onRunReadyOnly: () => void;
}

export function CohortPickerSmartBar({
  waitingCount,
  unassignedTotal,
  readyCount,
  idleAdvisorCount,
  filteredCount,
  allowOverLimit,
  isPending,
  result,
  error,
  onToggleOverLimit,
  onRunSmartSetupAndAssign,
  onRunReadyOnly,
}: Props) {
  const missingPoolCount = Math.max(0, waitingCount - readyCount);
  const scopeLabel = filteredCount < waitingCount ? `filtered (${filteredCount})` : `all (${waitingCount})`;

  return (
    <div className="space-y-2.5 rounded-xl border border-orange-200/70 bg-orange-50/55 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
          <span>
            <strong className="text-gray-900 tabular-nums">{unassignedTotal.toLocaleString()}</strong> unassigned
          </span>
          <span>
            <strong className="text-emerald-700 tabular-nums">{readyCount}</strong> ready ·{' '}
            <strong className="text-amber-700 tabular-nums">{missingPoolCount}</strong> missing pool
          </span>
          <span>
            <strong className="text-indigo-700 tabular-nums">{idleAdvisorCount}</strong> available idle advisor
            {idleAdvisorCount === 1 ? '' : 's'}
          </span>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-700">
          <input
            type="checkbox"
            checked={allowOverLimit}
            onChange={(e) => onToggleOverLimit(e.target.checked)}
            className="size-3.5 accent-[#F26F21]"
          />
          Allow exceeding max advisees
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending || filteredCount === 0 || (idleAdvisorCount === 0 && readyCount === 0)}
          onClick={onRunSmartSetupAndAssign}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {idleAdvisorCount > 0 && missingPoolCount > 0
            ? `Auto-setup pools & assign ${scopeLabel}`
            : `Smart auto-assign ${scopeLabel}`}
        </button>

        {readyCount > 0 && missingPoolCount > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={onRunReadyOnly}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-45"
          >
            <WandSparkles className="size-3.5 text-[#F26F21]" />
            Assign ready only ({readyCount})
          </button>
        )}
      </div>

      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <span>
            Assigned <strong>{result.assigned.toLocaleString()}</strong> students across{' '}
            <strong>{result.cohortsProcessed}</strong> cohorts
            {result.poolsConfigured > 0 && (
              <> · auto-configured <strong>{result.poolsConfigured}</strong> pools ({result.advisorsAddedToPools} advisors)</>
            )}
            {result.atRiskAssigned > 0 && (
              <> · balanced <strong>{result.atRiskAssigned}</strong> At-Risk</>
            )}
            {result.unassignedRemaining > 0 && (
              <> · <strong className="text-amber-800">{result.unassignedRemaining.toLocaleString()}</strong> left (capacity/pool limit)</>
            )}
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
