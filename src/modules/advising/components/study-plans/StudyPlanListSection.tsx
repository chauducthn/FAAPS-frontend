// Shared formatting helpers and plan list section for AdvisorStudyPlans.

import { BookOpenCheck, Clock3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { StudyPlanSummary } from '../../types/study-plan';

export const STUDY_PLAN_STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'bg-orange-100 text-orange-950 ring-orange-300',
  APPROVED: 'bg-emerald-100 text-emerald-950 ring-emerald-300',
  REJECTED: 'bg-red-100 text-red-950 ring-red-300',
  NEEDS_REVISION: 'bg-amber-100 text-amber-950 ring-amber-300',
};

export function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function formatStudyPlanStamp(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface StudyPlanListProps {
  items: StudyPlanSummary[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  page: number;
  totalPages: number;
  onPageChange: (updater: (prev: number) => number) => void;
  onOpenReview: (id: string) => void;
  onRetry: () => void;
}

export function StudyPlanList({
  items,
  isLoading,
  isError,
  search,
  page,
  totalPages,
  onPageChange,
  onOpenReview,
  onRetry,
}: StudyPlanListProps) {
  return (
    <div className="mt-5">
      {isLoading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5">
              <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load study plans.{' '}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
          {search.trim() ? 'No plans match your search.' : 'No study plans with this status.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((plan) => {
            const needsAction = plan.status === 'SUBMITTED';
            return (
              <li
                key={plan.id}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center',
                  needsAction ? 'border-[#F26F21]/40' : 'border-slate-200',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span
                    aria-hidden
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-extrabold text-white shadow-sm"
                  >
                    {initialsOf(plan.studentName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-slate-900">{plan.studentName ?? '—'}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                      {plan.studentCode} · {plan.semesterCode} · v{plan.version}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
                          STUDY_PLAN_STATUS_BADGE[plan.status] ?? STUDY_PLAN_STATUS_BADGE.SUBMITTED,
                        )}
                      >
                        {plan.status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                        <BookOpenCheck className="size-3.5 text-slate-500" aria-hidden />
                        {plan.totalCredits} credits
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <Clock3 className="size-3.5" aria-hidden />
                        {formatStudyPlanStamp(plan.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenReview(plan.id)}
                  className={cn(
                    'inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold shadow-sm transition-colors',
                    needsAction
                      ? 'bg-[#F26F21] text-white hover:bg-[#d95f14]'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#F26F21]/40 hover:text-[#F26F21]',
                  )}
                >
                  {needsAction ? 'Review now' : 'View details'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange((v) => v - 1)}
            className="inline-flex h-11 items-center rounded-xl px-4 font-bold transition-colors hover:bg-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="tabular-nums">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange((v) => v + 1)}
            className="inline-flex h-11 items-center rounded-xl px-4 font-bold transition-colors hover:bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
