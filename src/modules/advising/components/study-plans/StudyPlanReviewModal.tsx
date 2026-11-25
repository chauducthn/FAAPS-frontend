// Review modal for AdvisorStudyPlans showing student snapshot, courses, and decision form.

import { Modal } from '../../../../shared/components/ui/Modal';
import type { AdvisorStudentDetail } from '../../services/advisorService';
import type { LookupCourse } from '../../types/academic-lookup';
import type { AdvisorStudyPlanDetail, StudyPlanDecision } from '../../types/study-plan';
import { initialsOf } from './StudyPlanListSection';
import { StudyPlanReviewCourses } from './StudyPlanReviewCourses';
import { StudyPlanDecisionForm, StudyPlanReviewFooter } from './StudyPlanDecisionForm';
import { StudyPlanReviewSummary } from './StudyPlanReviewSummary';

interface StudyPlanReviewModalProps {
  open: boolean;
  detail: AdvisorStudyPlanDetail | undefined;
  detailLoading: boolean;
  detailError: boolean;
  onRetryDetail: () => void;
  studentDetail: AdvisorStudentDetail | undefined;
  studentDetailLoading: boolean;
  courseByCode: Map<string, LookupCourse>;
  passedByCode: Map<string, number | null>;
  decision: StudyPlanDecision;
  comment: string;
  isSubmitting: boolean;
  onDecisionChange: (decision: StudyPlanDecision) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function StudyPlanReviewModal({
  open,
  detail,
  detailLoading,
  detailError,
  onRetryDetail,
  studentDetail,
  studentDetailLoading,
  courseByCode,
  passedByCode,
  decision,
  comment,
  isSubmitting,
  onDecisionChange,
  onCommentChange,
  onSubmit,
  onClose,
}: StudyPlanReviewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Study plan review" className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 sm:px-7">
        <div className="flex min-w-0 items-center gap-3.5">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-extrabold text-white shadow-sm">
            {detail ? initialsOf(detail.studentName) : '–'}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
              {detail ? `${detail.studentName} · ${detail.plan.header.semesterCode}` : 'Study plan review'}
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {detail
                ? `${detail.studentCode} · v${detail.plan.header.version} · ${detail.plan.header.totalCredits} credits`
                : 'Loading plan details...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[62vh] overflow-y-auto p-6 sm:px-7">
        {detailLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : detailError || !detail ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
            Could not load this study plan.{' '}
            <button type="button" onClick={onRetryDetail} className="font-bold underline">Retry</button>
          </div>
        ) : (
          <div className="space-y-5">
            <StudyPlanReviewSummary
              detail={detail}
              studentDetail={studentDetail}
              studentDetailLoading={studentDetailLoading}
            />

            <StudyPlanReviewCourses
              detail={detail}
              courseByCode={courseByCode}
              passedByCode={passedByCode}
              totalCreditsEarned={studentDetail?.profile?.totalCreditsEarned ?? 0}
            />

            {detail.plan.header.reviewNotes && (
              <p className="rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                <span className="font-extrabold text-slate-900">Previous feedback: </span>
                {detail.plan.header.reviewNotes}
              </p>
            )}

            <StudyPlanDecisionForm
              status={detail.plan.header.status}
              decision={decision}
              comment={comment}
              onDecisionChange={onDecisionChange}
              onCommentChange={onCommentChange}
            />
          </div>
        )}
      </div>

      {detail?.plan.header.status === 'SUBMITTED' && (
        <StudyPlanReviewFooter
          decision={decision}
          comment={comment}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
