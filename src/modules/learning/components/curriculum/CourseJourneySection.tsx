import { ArrowCounterClockwise, CalendarCheck, CheckCircle, Clock, ClockCounterClockwise, WarningCircle } from '@phosphor-icons/react';
import {
  isCourseDraggable,
  isPrepEligibleCourse,
  type EffectiveCurriculumCourse,
  type EligibilityResult,
  type RegularBlockMeta,
} from './curriculumBlockRules';
import { classifyStatus, type AttemptSummary } from './curriculumCourseHelpers';

interface Props {
  course: EffectiveCurriculumCourse;
  activeSem?: number;
  history?: AttemptSummary;
  regularBlocks: RegularBlockMeta[];
  availableTerms: { sem: number; label: string }[];
  isSaving: boolean;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onSchedule: (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => void;
  onScheduleToTerm: (course: EffectiveCurriculumCourse, targetSem: number) => void;
  onResetCourse: (courseCode: string) => void;
}

export function CourseJourneySection({
  course,
  activeSem,
  history,
  regularBlocks,
  availableTerms,
  isSaving,
  validatePlacement,
  onSchedule,
  onScheduleToTerm,
  onResetCourse,
}: Props) {
  const attempts = history?.attempts ?? [];
  const failCount = history?.failCount ?? 0;
  const passCount = history?.passCount ?? 0;
  const canSchedule = isCourseDraggable(course);
  const currentSem = course.placement ? course.semesterNumber : (activeSem ?? course.semesterNumber);
  const currentBlockCode = course.placement?.blockCode ?? regularBlocks.find((b) => b.blockType === 'MAIN')?.code ?? 'BLOCK_10W';
  const allowPrep = isPrepEligibleCourse(course);
  const targetTerms = availableTerms.filter((t) => allowPrep || t.sem > 0);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-gray-500">
            <ClockCounterClockwise className="size-3.5 text-[#F26F21]" /> Attempt History
          </p>
          {attempts.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
              {failCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">Failed: {failCount}</span>
              )}
              {passCount > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Passed: {passCount}</span>
              )}
            </div>
          )}
        </div>

        {attempts.length === 0 ? (
          <p className="text-[11px] leading-relaxed text-gray-400">
            No attempts recorded yet. You can proactively plan or move this course to any eligible block below.
          </p>
        ) : (
          <div className="space-y-1.5">
            {attempts.map((a) => {
              const kind = classifyStatus(a);
              const icon = kind === 'PASSED'
                ? <CheckCircle className="size-3.5 shrink-0 text-emerald-600" weight="fill" />
                : kind === 'FAILED'
                  ? <WarningCircle className="size-3.5 shrink-0 text-red-600" weight="fill" />
                  : <Clock className="size-3.5 shrink-0 text-blue-600" weight="fill" />;
              return (
                <div
                  key={`${a.id}-${a.attemptNumber}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-200/70 bg-white px-2.5 py-1.5 text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="font-mono font-bold text-gray-800">#{a.attemptNumber}</span>
                    <span className="font-medium text-gray-600">{a.semesterCode || a.semesterName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={kind === 'PASSED' ? 'font-semibold text-emerald-700' : kind === 'FAILED' ? 'font-semibold text-red-700' : 'font-semibold text-blue-700'}>
                      {kind === 'PASSED' ? 'Passed' : kind === 'FAILED' ? 'Failed' : 'Studying'}
                    </span>
                    {a.finalScore != null && <span className="text-gray-500">· {a.finalScore.toFixed(1)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canSchedule && regularBlocks.length > 0 && (
        <div className="border-t border-gray-200/70 pt-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-gray-500">
              <CalendarCheck className="size-3.5 text-[#F26F21]" /> Plan Schedule
            </p>
            {course.placement && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onResetCourse(course.code)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] hover:underline disabled:opacity-50"
              >
                <ArrowCounterClockwise className="size-3" /> Reset (Sem {course.defaultSemesterNumber})
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="w-16 shrink-0 text-[11px] font-medium text-gray-500" htmlFor="schedule-sem">Term</label>
              <select
                id="schedule-sem"
                disabled={isSaving}
                value={currentSem}
                onChange={(e) => onScheduleToTerm(course, Number(e.target.value))}
                className="h-7 flex-1 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-800 focus:border-[#F26F21] focus:outline-none"
              >
                {targetTerms.map((t) => (
                  <option key={t.sem} value={t.sem}>
                    {t.label}{t.sem === course.defaultSemesterNumber ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {regularBlocks.map((b) => {
                const check = validatePlacement(course, currentSem, b);
                const isCurrent = currentBlockCode === b.code;
                return (
                  <button
                    key={b.code}
                    type="button"
                    disabled={isSaving || (!check.eligible && !isCurrent)}
                    title={check.eligible ? `Move to ${b.name}` : check.reason}
                    onClick={() => onSchedule(course, currentSem, b)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      isCurrent
                        ? 'border-[#F26F21] bg-orange-50 text-[#C2410C]'
                        : check.eligible
                          ? 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:text-[#C2410C]'
                          : 'cursor-not-allowed border-gray-100 bg-gray-100/70 text-gray-400'
                    }`}
                  >
                    {b.shortName} · {b.durationWeeks}w
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
