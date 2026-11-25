import { ChevronDown, CircleAlert, RotateCcw, Search, X } from 'lucide-react';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { USER_ROLE_LABEL, USER_STATUSES } from './userAccountColumns';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

export interface UserAccountsFilterBarProps {
  search: string;
  role: AdminUserRole | '';
  status: AdminUserStatus | '';
  majorId: string;
  cohortId: string;
  majors: { id: string; code: string; name: string }[];
  cohortOptions: { cohortId: string; majorCode: string; cohort: string; students: number }[];
  hasFilters: boolean;
  onSearchChange: (val: string) => void;
  onRoleChange: (val: AdminUserRole | '') => void;
  onStatusChange: (val: AdminUserStatus | '') => void;
  onMajorChange: (val: string) => void;
  onCohortChange: (val: string) => void;
  onClear: () => void;
}

export function UserAccountsFilterBar({
  search,
  role,
  status,
  majorId,
  cohortId,
  majors,
  cohortOptions,
  hasFilters,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onMajorChange,
  onCohortChange,
  onClear,
}: UserAccountsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, name, or email..."
          aria-label="Search accounts"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as AdminUserRole | '')}
          aria-label="Filter by role"
          className={selectClass}
        >
          <option value="">Role: All</option>
          {(Object.keys(USER_ROLE_LABEL) as AdminUserRole[]).map((r) => (
            <option key={r} value={r}>
              Role: {USER_ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[138px]">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as AdminUserStatus | '')}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option value="">Status: All</option>
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[158px]">
        <select
          value={majorId}
          onChange={(e) => onMajorChange(e.target.value)}
          aria-label="Filter by major"
          className={selectClass}
        >
          <option value="">Major: All</option>
          {majors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} — {m.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[146px]">
        <select
          value={cohortId}
          onChange={(e) => onCohortChange(e.target.value)}
          aria-label="Filter by cohort"
          className={selectClass}
        >
          <option value="">Cohort: All</option>
          {cohortOptions.map((c) => (
            <option key={c.cohortId} value={c.cohortId}>
              {c.majorCode} {c.cohort} ({c.students})
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
      >
        <RotateCcw className="size-3" /> Reset
      </button>
    </div>
  );
}

export function UserAccountsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">Could not load accounts</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          The list failed to load. Check your connection, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}
