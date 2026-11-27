import { Link } from 'react-router';
import { Warning as AlertTriangle, PencilSimple as Pencil } from '@phosphor-icons/react';
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
    <section className="rounded-lg border border-line/80 bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-4">
        <div className="flex items-center gap-3">
          <UserInitials name={advisor.fullName} className="size-11" />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink-primary">{advisor.fullName}</h2>
            <p className="text-xs text-ink-muted">{email ?? advisor.email}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line-soft bg-surface-page/70 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Current load</p>
          <div className="mt-1.5">
            <LoadBadge count={advisor.activeStudents} limit={advisor.maxAdvisees} />
          </div>
        </div>

        <div className="rounded-lg border border-line-soft bg-surface-page/70 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Advisory limit</p>
          {editingLimit ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                value={limitValue}
                onChange={(e) => onLimitValueChange(e.target.value)}
                aria-label="Advisory limit"
                className="h-8 w-20 rounded-lg border border-line bg-white px-2 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
              <button
                type="button"
                disabled={isSavingLimit}
                onClick={onSaveLimit}
                className="h-8 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
              >
                Save
              </button>
              <button type="button" onClick={onCancelEditLimit}
                className={
                  'px-1.5 text-xs ' +
                  'font-medium text-ink-muted hover:text-ink-primary'
                }>
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-ink-primary tabular-nums">
              {advisor.maxAdvisees ?? 'No limit'}
              <button
                type="button"
                onClick={onStartEditLimit}
                aria-label="Edit advisory limit"
                className="rounded-md p-1 text-ink-subtle transition-colors hover:bg-line/70 hover:text-ink-secondary"
              >
                <Pencil className="size-3.5" />
              </button>
            </p>
          )}
          {limitError && <p className="mt-1 text-xs text-red-600">{limitError}</p>}
        </div>

        <div className="rounded-lg border border-line-soft bg-surface-page/70 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Assignment start date</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="date"
              aria-label="Start date"
              value={assignmentStartDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="h-8 flex-1 rounded-lg border border-line bg-white px-2 text-xs text-ink-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={onSaveDate}
              className="h-8 shrink-0 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-line-soft"
            >
              Save date
            </button>
          </div>
          {scheduleError && <p className="mt-1 text-xs text-red-600">{scheduleError}</p>}
        </div>
      </div>

      {overBy > 0 && (
        <p className="mt-3.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          This advisor is {overBy} over the advisory limit. Raise the limit or reassign some students.
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
    <section className="rounded-lg border border-line/80 bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Assigned cohorts</h2>
        <button
          type="button"
          onClick={onAssignCohort}
          className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          Assign cohort
        </button>
      </div>
      {cohorts.length === 0 ? (
        <p className="mt-2.5 text-xs text-ink-muted">This advisor has no cohort yet: none configured and no students assigned.</p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((c) => (
            <li key={c.cohortId} className="flex items-center justify-between gap-2 rounded-lg border border-line-soft bg-surface-page/70 px-3 py-2.5 text-xs">
              <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className="font-semibold text-ink-primary hover:text-brand">
                {c.label}
              </Link>
              <span className="flex items-center gap-2 text-ink-muted">
                <span className="tabular-nums">{c.students}</span>
                <span
                  className={
                    c.configured
                      ? 'rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700'
                      : 'rounded-md bg-line-soft px-2 py-0.5 text-[11px] font-medium text-ink-muted'
                  }
                >
                  {c.configured ? 'Configured' : 'Not configured'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
