import { DotsSixVertical, Plus, WarningCircle } from '@phosphor-icons/react';
import { isCourseDraggable, type EffectiveCurriculumCourse } from './curriculumBlockRules';
import { formatTermShort } from './curriculumPrereqRules';

interface PoolCourseCardProps {
  course: EffectiveCurriculumCourse;
  isFailed: boolean;
  isOverdue: boolean;
  inDraft: boolean;
  draftLabel: string;
  isSaving: boolean;
  onSelectInspect: (course: EffectiveCurriculumCourse) => void;
  onAddToDraft: (course: EffectiveCurriculumCourse) => void;
  onDragStartCourse: (course: EffectiveCurriculumCourse) => void;
  onDragEndCourse: () => void;
}

export function PoolCourseCard({
  course, isFailed, isOverdue, inDraft, draftLabel, isSaving,
  onSelectInspect, onAddToDraft, onDragStartCourse, onDragEndCourse,
}: PoolCourseCardProps) {
  const draggable = isCourseDraggable(course);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onClick={() => onSelectInspect(course)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectInspect(course); } }}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData('text/plain', course.code);
        e.dataTransfer.effectAllowed = 'move';
        onDragStartCourse(course);
      }}
      onDragEnd={onDragEndCourse}
      className={`group min-w-0 rounded-xl border p-3 text-left shadow-2xs transition-all hover:shadow-sm ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isFailed
          ? 'border-red-200 bg-red-50/60 hover:border-red-300 hover:bg-red-50'
          : 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50/85'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {draggable && (
            <DotsSixVertical className={`size-3.5 shrink-0 transition-colors ${isFailed ? 'text-red-300 group-hover:text-red-500' : 'text-amber-400/70 group-hover:text-amber-600'}`} />
          )}
          <span className={`font-mono text-xs font-bold ${isFailed ? 'text-red-900' : 'text-amber-950'}`}>
            {course.code}
          </span>
          <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${isFailed ? 'bg-red-100/80 text-red-700' : 'bg-amber-100/80 text-amber-800'}`}>
            {formatTermShort(course.defaultSemesterNumber)}
          </span>
          <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-600 ring-1 ring-inset ring-black/5">
            {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isFailed ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              <WarningCircle className="size-3" weight="fill" /> Failed
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {isOverdue ? 'Overdue' : 'Not taken'}
            </span>
          )}
          {inDraft ? (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
              In Draft
            </span>
          ) : draggable ? (
            <button
              type="button"
              disabled={isSaving}
              title={`Add ${course.code} to ${draftLabel}`}
              onClick={(e) => { e.stopPropagation(); onAddToDraft(course); }}
              className="inline-flex h-6 items-center gap-0.5 rounded-md border border-orange-200 bg-orange-50/70 px-1.5 text-[10px] font-semibold text-[#C2410C] transition-colors hover:bg-orange-100 disabled:opacity-50"
            >
              <Plus className="size-3" weight="bold" /> Draft
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs font-medium text-gray-700">{course.name}</p>
    </div>
  );
}
