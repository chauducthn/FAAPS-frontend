import { ArrowCounterClockwise, CalendarCheck, CaretDown } from '@phosphor-icons/react';
import {
  isCourseDraggable,
  isPrepEligibleCourse,
  type EffectiveCurriculumCourse,
  type EligibilityResult,
  type RegularBlockMeta,
} from './curriculumBlockRules';
import type { AttemptSummary } from './curriculumCourseHelpers';
import { formatTermShort } from './curriculumPrereqRules';

interface Props {
  course: EffectiveCurriculumCourse;
  activeSem?: number;
  minPlannableSem?: number;
  isPassed?: boolean;
  history?: AttemptSummary;
  regularBlocks: RegularBlockMeta[];
  availableTerms: { sem: number; label: string }[];
  isSaving: boolean;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onSchedule: (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => void;
  onScheduleToTerm: (course: EffectiveCurriculumCourse, targetSem: number) => void;
  onResetCourse: (courseCode: string) => void;
}

const selectCls =
  'h-8 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-2.5 pr-7 text-[11px] font-semibold text-gray-800 focus:border-[#F26F21] focus:outline-none disabled:opacity-50';

export function CourseJourneySection({
  course,
  activeSem,
  minPlannableSem,
  isPassed = false,
  regularBlocks,
  availableTerms,
  isSaving,
  validatePlacement,
  onSchedule,
  onScheduleToTerm,
  onResetCourse,
}: Props) {
  const canSchedule = isCourseDraggable(course) && (!isPassed || !!course.placement);
  if (!canSchedule || regularBlocks.length === 0) return null;

  const currentSem = course.placement ? course.semesterNumber : (activeSem && activeSem !== 0 ? activeSem : course.semesterNumber);
  const currentBlockCode = course.placement?.blockCode ?? regularBlocks.find((b) => b.blockType === 'MAIN')?.code ?? 'BLOCK_10W';
  const allowPrep = isPrepEligibleCourse(course);
  const isPastSem = (sem: number) => minPlannableSem != null && minPlannableSem >= 1 && sem < minPlannableSem;
  const targetTerms = availableTerms.filter((t) => (allowPrep || t.sem > 0) && !isPastSem(t.sem));
  const currentInPast = isPastSem(currentSem);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
          <CalendarCheck className="size-3.5 text-[#F26F21]" /> Plan Schedule
        </p>
        {course.placement && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onResetCourse(course.code)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] hover:underline disabled:opacity-50"
          >
            <ArrowCounterClockwise className="size-3" /> Reset ({formatTermShort(course.defaultSemesterNumber)})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400" htmlFor="schedule-sem">
            Term
          </label>
          <div className="relative">
            <select
              id="schedule-sem"
              disabled={isSaving || isPassed}
              value={currentSem}
              onChange={(e) => onScheduleToTerm(course, Number(e.target.value))}
              className={selectCls}
            >
              {currentInPast && (
                <option value={currentSem} disabled>
                  {formatTermShort(currentSem)} (past)
                </option>
              )}
              {targetTerms.map((t) => (
                <option key={t.sem} value={t.sem}>
                  {t.label}{t.sem === course.defaultSemesterNumber ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <CaretDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400" htmlFor="schedule-block">
            Block
          </label>
          <div className="relative">
            <select
              id="schedule-block"
              disabled={isSaving || isPassed || currentInPast}
              value={currentBlockCode}
              onChange={(e) => {
                const nextBlock = regularBlocks.find((b) => b.code === e.target.value);
                if (nextBlock) onSchedule(course, currentSem, nextBlock);
              }}
              className={selectCls}
            >
              {regularBlocks.map((b) => {
                const check = validatePlacement(course, currentSem, b);
                const isCurrent = currentBlockCode === b.code;
                const label = new RegExp(`\\b${b.durationWeeks}w\\b`, 'i').test(b.shortName)
                  ? b.shortName
                  : `${b.shortName} · ${b.durationWeeks}w`;
                return (
                  <option key={b.code} value={b.code} disabled={!check.eligible && !isCurrent}>
                    {label}{!check.eligible && !isCurrent ? ' (unavailable)' : ''}
                  </option>
                );
              })}
            </select>
            <CaretDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
