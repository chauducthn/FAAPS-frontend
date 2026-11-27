import { CaretRight, CheckCircle, Clock, DotsSixVertical, WarningCircle } from '@phosphor-icons/react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { PlannedCourseRow } from './curriculumBlockPlanner';
import { isCourseDraggable, type EffectiveCurriculumCourse } from './curriculumBlockRules';
import { classifyStatus, type AttemptSummary, type CourseStatusKind } from './curriculumCourseHelpers';

const CARD_ACCENT: Record<CourseStatusKind, string> = {
  PASSED: 'border-emerald-200/80 hover:border-emerald-300',
  IN_PROGRESS: 'border-blue-200/80 hover:border-blue-300',
  FAILED: 'border-red-200/90 hover:border-red-300',
  NOT_TAKEN: 'border-gray-200/80 hover:border-orange-300',
};

function StatusBadge({ row }: { row?: TranscriptRow }) {
  const kind = classifyStatus(row);
  const score = row?.finalScore != null ? ` · ${row.finalScore.toFixed(1)}` : '';
  if (kind === 'PASSED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle className="size-3.5" weight="fill" /> Passed{score}
      </span>
    );
  }
  if (kind === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
        <Clock className="size-3.5" weight="fill" /> Studying
      </span>
    );
  }
  if (kind === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        <WarningCircle className="size-3.5" weight="fill" /> Failed{score}
      </span>
    );
  }
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">Not taken</span>;
}

interface Props {
  item: PlannedCourseRow;
  row?: TranscriptRow;
  history?: AttemptSummary;
  isSelected: boolean;
  isDragging: boolean;
  showSemester: boolean;
  onSelect: (course: EffectiveCurriculumCourse) => void;
  onDragStart: (course: EffectiveCurriculumCourse) => void;
  onDragEnd: () => void;
}

function shortGroupTag(groupName: string): string {
  const g = groupName.trim();
  if (/^English Prep$/i.test(g)) return 'PEN';
  if (/^Physical Education$/i.test(g)) return 'PE';
  if (/^Musical Instrument$/i.test(g)) return 'TMI';
  return g.split(/\s*[—–]\s*/)[0].trim();
}

export function CurriculumCourseCard({
  item,
  row,
  history,
  isSelected,
  isDragging,
  showSemester,
  onSelect,
  onDragStart,
  onDragEnd,
}: Props) {
  const { course } = item;
  const draggable = isCourseDraggable(course);
  const placement = course.placement;
  const movedSem = placement && placement.semesterNumber !== course.defaultSemesterNumber;

  const groupTag = course.groupName ? shortGroupTag(course.groupName) : null;
  const formatTerm = (s: number) => (s < 0 ? `Prep ${-s}` : s === 0 ? 'Prep' : `Sem ${s}`);
  const placementTag = placement
    ? placement.planMode === 'RETAKE'
      ? 'Retake'
      : movedSem
        ? `${formatTerm(course.defaultSemesterNumber)}→${formatTerm(placement.semesterNumber)}`
        : 'Custom'
    : null;
  const hasFooterTags = !!(history && history.failCount > 0) || !!(history && history.passCount > 1);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onClick={() => onSelect(course)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(course); } }}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData('text/plain', course.code);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(course);
      }}
      onDragEnd={onDragEnd}
      className={`group flex flex-col justify-between rounded-xl border bg-white p-3.5 text-left shadow-2xs transition-all hover:shadow-sm ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'scale-[0.98] opacity-50' : ''} ${
        isSelected ? 'border-[#F26F21] ring-2 ring-[#F26F21]/20' : CARD_ACCENT[classifyStatus(row)]
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {draggable && (
              <DotsSixVertical className="size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
            )}
            {showSemester && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-600">
                Sem {course.semesterNumber}
              </span>
            )}
            <span className="font-mono text-sm font-bold text-gray-900 group-hover:text-[#C2410C]">{course.code}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
              {course.credits} cr
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {placementTag && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                {placementTag}
              </span>
            )}
            {groupTag && (
              <span
                title={course.groupName ?? undefined}
                className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700"
              >
                {groupTag}
              </span>
            )}
            <StatusBadge row={row} />
          </div>
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-800">{course.name}</p>
          {!hasFooterTags && (
            <CaretRight className="size-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#F26F21]" />
          )}
        </div>
      </div>

      {hasFooterTags && (
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {history && history.failCount > 0 && (
              <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-inset ring-red-200/80">
                Failed ×{history.failCount}
              </span>
            )}
            {history && history.passCount > 1 && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/80">
                Passed ×{history.passCount}
              </span>
            )}
          </div>
          <CaretRight className="size-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#F26F21]" />
        </div>
      )}
    </div>
  );
}
