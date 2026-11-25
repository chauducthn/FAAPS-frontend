import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { USER_ROLE_LABEL, USER_STATUSES } from './userAccountColumns';

const selectClass =
  'w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

export interface UserAccountsFilterBarProps {
  search: string;
  role: AdminUserRole | '';
  status: AdminUserStatus | '';
  majorId: string;
  cohortId: string;
  majors: { id: string; code: string; name: string }[];
  cohortOptions: { cohortId: string; majorCode: string; cohort: string; students: number }[];
  hasFilters: boolean;
  total: number;
  shownCount: number;
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
  total,
  shownCount,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onMajorChange,
  onCohortChange,
  onClear,
}: UserAccountsFilterBarProps) {
  return (
    <div className="space-y-3 border-b border-gray-100 bg-gray-50/40 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, name, or email..."
            aria-label="Search accounts"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-8 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs font-medium text-gray-500 tabular-nums">
            Showing <span className="font-bold text-gray-900">{shownCount}</span> of{' '}
            <span className="font-bold text-gray-900">{total}</span>
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
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
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
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
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={majorId}
            onChange={(e) => onMajorChange(e.target.value)}
            aria-label="Filter by major"
            className={selectClass}
          >
            <option value="">Major: All</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                Major: {m.code} — {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={cohortId}
            onChange={(e) => onCohortChange(e.target.value)}
            aria-label="Filter by cohort"
            className={selectClass}
          >
            <option value="">Cohort: All</option>
            {cohortOptions.map((c) => (
              <option key={c.cohortId} value={c.cohortId}>
                Cohort: {c.majorCode} {c.cohort} ({c.students})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
