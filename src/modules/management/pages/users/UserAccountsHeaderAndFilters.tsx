import type { ReactNode } from 'react';
import {
  ChevronDown,
  CircleAlert,
  GraduationCap,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { USER_ROLE_LABEL, USER_STATUSES } from './userAccountColumns';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

function Kpi({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-lg font-extrabold tabular-nums leading-tight text-gray-900">
          {value} <span className="text-[11px] font-medium text-gray-500">{hint}</span>
        </p>
      </div>
    </div>
  );
}

export function UserAccountsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
          <Users className="size-5.5" />
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-gray-900">User Accounts</h1>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
      >
        <Plus className="size-4" strokeWidth={2.5} /> Create user
      </button>
    </div>
  );
}

export function UserAccountsKpiStrip({
  studentCount,
  advisorCount,
  total,
}: {
  studentCount?: number;
  advisorCount?: number;
  total: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Kpi icon={<GraduationCap className="size-4" />} label="Students" value={String(studentCount ?? '—')} hint="accounts" />
      <Kpi icon={<UserRound className="size-4" />} label="Advisors" value={String(advisorCount ?? '—')} hint="accounts" />
      <Kpi icon={<ShieldCheck className="size-4" />} label="Matching" value={String(total)} hint="current filters" />
    </div>
  );
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
}: {
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
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, name, or email..."
            aria-label="Search accounts"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
          />
        </div>
        <div className="flex flex-wrap gap-3 sm:flex-row">
          <div className="relative">
            <select value={role} onChange={(e) => onRoleChange(e.target.value as AdminUserRole | '')} aria-label="Filter by role" className={`${selectClass} w-full sm:w-40`}>
              <option value="">Role: All</option>
              {(Object.keys(USER_ROLE_LABEL) as AdminUserRole[]).map((r) => (
                <option key={r} value={r}>Role: {USER_ROLE_LABEL[r]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select value={status} onChange={(e) => onStatusChange(e.target.value as AdminUserStatus | '')} aria-label="Filter by status" className={`${selectClass} w-full sm:w-44`}>
              <option value="">Status: All</option>
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>Status: {s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select value={majorId} onChange={(e) => onMajorChange(e.target.value)} aria-label="Filter by major" className={`${selectClass} w-full sm:w-52`}>
              <option value="">Major: All</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>Major: {m.code} — {m.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select value={cohortId} onChange={(e) => onCohortChange(e.target.value)} aria-label="Filter by cohort" className={`${selectClass} w-full sm:w-48`}>
              <option value="">Cohort: All</option>
              {cohortOptions.map((c) => (
                <option key={c.cohortId} value={c.cohortId}>Cohort: {c.majorCode} {c.cohort} ({c.students})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
          {hasFilters && (
            <button type="button" onClick={onClear} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
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
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700">
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}
