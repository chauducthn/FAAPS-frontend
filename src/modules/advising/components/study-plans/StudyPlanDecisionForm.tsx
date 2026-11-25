// Decision selector, feedback form, and action footer for StudyPlanReviewModal.

import { cn } from '@/shared/lib/utils';
import type { StudyPlanDecision } from '../../types/study-plan';

const DECISIONS: { key: StudyPlanDecision; label: string; hint: string; active: string }[] = [
  { key: 'APPROVED', label: 'Approve', hint: 'Plan meets all requirements', active: 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-emerald-200' },
  { key: 'NEEDS_REVISION', label: 'Needs revision', hint: 'Ask the student to fix & resubmit', active: 'border-amber-500 bg-amber-50 text-amber-950 ring-amber-200' },
  { key: 'REJECTED', label: 'Reject', hint: 'Plan cannot be accepted', active: 'border-red-500 bg-red-50 text-red-950 ring-red-200' },
];

export function StudyPlanDecisionForm({
  status,
  decision,
  comment,
  onDecisionChange,
  onCommentChange,
}: {
  status: string;
  decision: StudyPlanDecision;
  comment: string;
  onDecisionChange: (decision: StudyPlanDecision) => void;
  onCommentChange: (comment: string) => void;
}) {
  if (status !== 'SUBMITTED') {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
        This plan is {status.toLowerCase().replaceAll('_', ' ')} — decisions are locked.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">Your decision</h3>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Review decision">
        {DECISIONS.map((d) => {
          const selected = decision === d.key;
          return (
            <button
              key={d.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onDecisionChange(d.key)}
              className={cn(
                'rounded-xl border p-3.5 text-left ring-1 ring-inset transition-all',
                selected ? d.active : 'border-slate-200 bg-white text-slate-700 ring-transparent hover:border-slate-300',
              )}
            >
              <span className="block text-[15px] font-extrabold">{d.label}</span>
              <span className={cn('mt-0.5 block text-sm font-medium', selected ? '' : 'text-slate-600')}>
                {d.hint}
              </span>
            </button>
          );
        })}
      </div>
      <label className="mt-4 block text-sm font-bold text-slate-900" htmlFor="review-comment">
        Feedback to student {decision !== 'APPROVED' && <span className="text-red-700">(required)</span>}
      </label>
      <textarea
        id="review-comment"
        rows={4}
        maxLength={10000}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder={
          decision === 'APPROVED'
            ? 'Optional note, e.g. Good balance of 18 credits — good luck this semester.'
            : 'Explain what to fix, e.g. Replace SE405 (missing prerequisite SE301) and resubmit.'
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
      />
    </div>
  );
}

export function StudyPlanReviewFooter({
  decision,
  comment,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  decision: StudyPlanDecision;
  comment: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const actionLabel =
    decision === 'APPROVED' ? 'approval' : decision === 'REJECTED' ? 'rejection' : 'revision request';
  return (
    <div className="flex flex-col gap-2.5 border-t border-slate-200 p-6 sm:flex-row sm:justify-end sm:px-7">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || (decision !== 'APPROVED' && !comment.trim())}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : `Confirm ${actionLabel}`}
      </button>
    </div>
  );
}
