import { CheckCircle, Clock, DotsSixVertical, WarningCircle, X } from '@phosphor-icons/react';
import { WorkloadBadge } from '../../../academic/components/WorkloadBadge';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { PlannedCourseRow } from './curriculumBlockPlanner';
import { isCourseDraggable, type EffectiveCurriculumCourse } from './curriculumBlockRules';
import { classifyStatus, type AttemptSummary, type CourseStatusKind } from './curriculumCourseHelpers';

const CARD_SURFACE: Record<CourseStatusKind, string> = {
  PASSED: 'bg-emerald-50/50 border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50',
  IN_PROGRESS: 'bg-blue-50/40 border-blue-200/80 hover:border-blue-300 hover:bg-blue-50',
  FAILED: 'bg-red-50/50 border-red-200/90 hover:border-red-300 hover:bg-red-50',
  NOT_TAKEN: 'bg-white border-gray-200/80 hover:border-orange-300 hover:bg-orange-50/30',
};

const CARD_SELECTED_BG: Record<CourseStatusKind, string> = {
  PASSED: 'bg-emerald-50/60',
  IN_PROGRESS: 'bg-blue-50/60',
  FAILED: 'bg-red-50/70',
  NOT_TAKEN: 'bg-orange-50/30',
};

function StatusBadge({ row }: { row?: TranscriptRow }) {
  const kind = classifyStatus(row);
  const score = row?.finalScore != null ? ` · ${row.finalScore.toFixed(1)}` : '';
  if (kind === 'PASSED') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><CheckCircle className="size-3.5" weight="fill" /> Passed{score}</span>;
  if (kind === 'IN_PROGRESS') return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"><Clock className="size-3.5" weight="fill" /> Studying</span>;
  if (kind === 'FAILED') return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"><WarningCircle className="size-3.5" weight="fill" /> Failed{score}</span>;
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">Not taken</span>;
}

interface Props {
  item: PlannedCourseRow;
  row?: TranscriptRow;
  history?: AttemptSummary;
  isSelected: boolean;
  isDragging: boolean;
  showSemester: boolean;
  allowDrag?: boolean;
  onSelect: (course: EffectiveCurriculumCourse) => void;
  onDragStart: (course: EffectiveCurriculumCourse) => void;
  onDragEnd: () => void;
  onRemoveFromDraft?: (course: EffectiveCurriculumCourse) => void;
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
  allowDrag = true,
  onSelect,
  onDragStart,
  onDragEnd,
  onRemoveFromDraft,
}: Props) {
  const { course } = item;
  const draggable = allowDrag && isCourseDraggable(course) && classifyStatus(row) !== 'PASSED';
  const placement = course.placement;
  const movedSem = placement && placement.semesterNumber !== course.defaultSemesterNumber;

  const groupTag = course.groupName ? shortGroupTag(course.groupName) : null;
  const equivalentFrom =
    row && row.courseCode.trim().toUpperCase() !== course.code.trim().toUpperCase() ? row.courseCode : null;
  const formatTerm = (s: number) => (s < 0 ? `Prep ${-s}` : s === 0 ? 'Prep' : `Sem ${s}`);
  const placementTag = placement
    ? placement.planMode === 'DRAFT'
      ? `From ${formatTerm(course.defaultSemesterNumber)}`
      : placement.planMode === 'RETAKE'
        ? 'Retake'
        : movedSem
          ? `${formatTerm(course.defaultSemesterNumber)}→${formatTerm(placement.semesterNumber)}`
          : 'Custom'
    : course.takenSemesterCode
      ? course.takenSemesterCode
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
      className={`group flex min-w-0 flex-col justify-between rounded-xl border p-3.5 text-left shadow-2xs transition-all hover:shadow-sm ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'scale-[0.98] opacity-50' : ''} ${
        isSelected
          ? `${CARD_SELECTED_BG[classifyStatus(row)]} border-[#F26F21] ring-2 ring-[#F26F21]/20`
          : CARD_SURFACE[classifyStatus(row)]
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {draggable && (
              <DotsSixVertical className="size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
            )}
            {showSemester && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-600">
                Sem {course.semesterNumber}
              </span>
            )}
            <span className="font-mono text-sm font-bold text-gray-900 group-hover:text-[#C2410C]">{course.code}</span>
            <span className="whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
              {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
            </span>
            {course.workload && (
              <WorkloadBadge workload={course.workload} className="px-2 py-0.5 text-[10px]" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {equivalentFrom && (
              <span
                title={`Completed via equivalent course ${equivalentFrom}`}
                className="rounded-full bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-teal-700"
              >
                via {equivalentFrom}
              </span>
            )}
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
            {onRemoveFromDraft && (
              <button
                type="button"
                title="Remove from Draft Term"
                aria-label={`Remove ${course.code} from Draft Term`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromDraft(course);
                }}
                className="inline-flex size-5 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 min-w-0">
          <p title={course.name} className="truncate text-[13px] font-semibold leading-snug text-gray-800">
            {course.name}
          </p>
        </div>
      </div>

      {hasFooterTags && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-gray-100 pt-2">
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
        </div>
      )}
    </div>
  );
}
