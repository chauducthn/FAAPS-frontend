import {
  CaretDown as ChevronDown,
  WarningCircle as CircleAlert,
  MagnifyingGlassMinus,
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlass as Search,
  Users,
  X,
} from '@phosphor-icons/react';
import { EmptyState } from '@/shared/components/common/EmptyState';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { USER_ROLE_LABEL, USER_STATUSES } from './userAccountColumns';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-line bg-white pl-3 pr-7 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

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
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, name, or email..."
          aria-label="Search accounts"
          className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-7 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink-muted"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[124px]">
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as AdminUserRole | '')}
          aria-label="Filter by role"
          className={selectClass}
        >
          <option value="">All roles</option>
          {(Object.keys(USER_ROLE_LABEL) as AdminUserRole[]).map((r) => (
            <option key={r} value={r}>
              {USER_ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as AdminUserStatus | '')}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option value="">All statuses</option>
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[158px]">
        <select
          value={majorId}
          onChange={(e) => onMajorChange(e.target.value)}
          aria-label="Filter by major"
          className={selectClass}
        >
          <option value="">All majors</option>
          {majors.map((m) => (
            <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[146px]">
        <select
          value={cohortId}
          onChange={(e) => onCohortChange(e.target.value)}
          aria-label="Filter by cohort"
          className={selectClass}
        >
          <option value="">All cohorts</option>
          {(() => {
            const selectedMajor = majorId ? majors.find((m) => m.id === majorId) : undefined;
            const seen = new Set<string>();
            for (const c of cohortOptions) {
              if (selectedMajor && c.majorCode !== selectedMajor.code) continue;
              const label = c.cohort.trim().toUpperCase();
              if (label) seen.add(label);
            }
            return [...seen]
              .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
              .map((cohort) => (
                <option key={cohort} value={cohort}>
                  {cohort}
                </option>
              ));
          })()}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}

export function UserAccountsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">Could not load accounts</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The list failed to load. Check your connection, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function UserAccountsEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <EmptyState
      className="admin-fill justify-center"
      icon={hasFilters ? <MagnifyingGlassMinus aria-hidden /> : <Users aria-hidden />}
      title={hasFilters ? 'No accounts match your filters' : 'No accounts yet'}
      description={
        hasFilters
          ? 'Try a different keyword, or clear the role / status filters to see all accounts.'
          : 'Use Add account or Import above to start adding students and advisors.'
      }
    />
  );
}
