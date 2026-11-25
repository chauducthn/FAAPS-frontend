import { CircleAlert, RotateCcw, X } from 'lucide-react';
import type { AdminUserRole, AdminUserStatus } from '../../types/admin';
import { USER_ROLE_LABEL } from './userAccountColumns';

interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function UserAccountsActiveChips({
  role,
  status,
  majorId,
  cohortId,
  majors,
  cohortOptions,
  onClearRole,
  onClearStatus,
  onClearMajor,
  onClearCohort,
}: {
  role: AdminUserRole | '';
  status: AdminUserStatus | '';
  majorId: string;
  cohortId: string;
  majors: { id: string; code: string; name: string }[];
  cohortOptions: { cohortId: string; majorCode: string; cohort: string; students: number }[];
  onClearRole: () => void;
  onClearStatus: () => void;
  onClearMajor: () => void;
  onClearCohort: () => void;
}) {
  const chips: ActiveChip[] = [];

  if (role) {
    chips.push({ key: 'role', label: `Role: ${USER_ROLE_LABEL[role]}`, onRemove: onClearRole });
  }
  if (status) {
    const formatted = status.charAt(0) + status.slice(1).toLowerCase();
    chips.push({ key: 'status', label: `Status: ${formatted}`, onRemove: onClearStatus });
  }
  if (majorId) {
    const major = majors.find((m) => m.id === majorId);
    chips.push({ key: 'major', label: `Major: ${major ? major.code : majorId}`, onRemove: onClearMajor });
  }
  if (cohortId) {
    const cohort = cohortOptions.find((c) => c.cohortId === cohortId);
    chips.push({
      key: 'cohort',
      label: `Cohort: ${cohort ? `${cohort.majorCode} ${cohort.cohort}` : cohortId}`,
      onRemove: onClearCohort,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-white px-4 py-2.5 sm:px-5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#9a3412]"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label}`}
            className="rounded-full p-0.5 text-[#C2410C] hover:bg-orange-100"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
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
        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}
