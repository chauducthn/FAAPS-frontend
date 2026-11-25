import { Link } from 'react-router';
import { AlertTriangle, Pencil } from 'lucide-react';
import { LoadBadge } from '../../components/LoadBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { UserInitials } from '../../components/UserInitials';
import type { AdminUserStatus } from '../../types/admin';

export interface AdvisorCohortSummary {
  cohortId: string;
  label: string;
  students: number;
  configured: boolean;
}

export function AdvisorProfileCard({
  advisor,
  email,
  status,
  overBy,
  assignmentStartDate,
  scheduleError,
  editingLimit,
  limitValue,
  limitError,
  isSavingLimit,
  onStartDateChange,
  onSaveDate,
  onLimitValueChange,
  onStartEditLimit,
  onCancelEditLimit,
  onSaveLimit,
}: {
  advisor: { id: string; fullName: string; email: string; activeStudents: number; maxAdvisees: number | null };
  email?: string | null;
  status: AdminUserStatus;
  overBy: number;
  assignmentStartDate: string;
  scheduleError: string | null;
  editingLimit: boolean;
  limitValue: string;
  limitError: string | null;
  isSavingLimit: boolean;
  onStartDateChange: (val: string) => void;
  onSaveDate: () => void;
  onLimitValueChange: (val: string) => void;
  onStartEditLimit: () => void;
  onCancelEditLimit: () => void;
  onSaveLimit: () => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 rounded-lg border border-[#e5e7eb] p-4">
        <h3 className="text-sm font-semibold text-[#151c27]">Assignment start date</h3>
        <label className="mt-3 flex items-center gap-3 text-sm">
          Start date
          <input
            type="date"
            value={assignmentStartDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="rounded-md border border-[#e5e7eb] p-1"
          />
        </label>
        {scheduleError && <p className="mt-2 text-sm text-red-600">{scheduleError}</p>}
        <button
          type="button"
          className="mt-3 rounded-md bg-[#f37021] px-3 py-1.5 text-sm font-semibold text-white"
          onClick={onSaveDate}
        >
          Save date
        </button>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserInitials name={advisor.fullName} className="size-12" />
          <div>
            <h2 className="text-xl font-semibold text-[#151c27]">{advisor.fullName}</h2>
            <p className="text-sm text-[#555f6f]">{email ?? ' '}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Email</p>
          <p className="mt-1 text-base font-semibold text-[#151c27]">{advisor.email}</p>
        </div>
        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Students</p>
          <p className="mt-1">
            <LoadBadge count={advisor.activeStudents} limit={advisor.maxAdvisees} />
          </p>
        </div>
        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisory limit</p>
          {editingLimit ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={limitValue}
                onChange={(e) => onLimitValueChange(e.target.value)}
                aria-label="Advisory limit"
                className="h-8 w-20 rounded-md border border-[#e5e7eb] px-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                disabled={isSavingLimit}
                onClick={onSaveLimit}
                className="rounded-md bg-[#f37021] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
              >
                Save
              </button>
              <button type="button" onClick={onCancelEditLimit} className="text-xs font-semibold text-[#555f6f] hover:underline">
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1 flex items-center gap-2 text-base font-semibold text-[#151c27]">
              {advisor.maxAdvisees ?? 'No limit'}
              <button
                type="button"
                onClick={onStartEditLimit}
                aria-label="Edit advisory limit"
                className="rounded-md p-1 text-[#555f6f] hover:bg-gray-200"
              >
                <Pencil className="size-3.5" />
              </button>
            </p>
          )}
          {limitError && <p className="mt-1 text-xs text-red-600">{limitError}</p>}
        </div>
      </div>
      {overBy > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          This advisor is {overBy} over the advisory limit. The limit is a warning, not a block; raise it or move some students to another advisor.
        </p>
      )}
    </section>
  );
}

export function AdvisorCohortsCard({
  cohorts,
  onAssignCohort,
}: {
  cohorts: AdvisorCohortSummary[];
  onAssignCohort: () => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#151c27]">Cohorts</h2>
        <button
          type="button"
          onClick={onAssignCohort}
          className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
        >
          Assign cohort
        </button>
      </div>
      {cohorts.length === 0 ? (
        <p className="mt-3 text-sm text-[#555f6f]">This advisor has no cohort yet: none configured and no students assigned.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {cohorts.map((c) => (
            <li key={c.cohortId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
              <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className="font-semibold text-[#151c27] hover:text-orange-600">
                {c.label}
              </Link>
              <span className="flex items-center gap-3 text-[#555f6f]">
                {c.students} assigned student{c.students === 1 ? '' : 's'}
                {c.configured ? (
                  <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">Configured</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-[#555f6f]">Not configured</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
