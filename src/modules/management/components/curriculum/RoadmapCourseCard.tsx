// One course card of the Academic Roadmap board.
// Clicking the course name or a "Requires [code]" chip opens the CourseDetailModal.
import { useRef, useState } from 'react';
import { DotsSixVertical as GripVertical, Stack as Layers, Star } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { RoadmapCourse } from '../../../academic/types/roadmap';
import { RoadmapCourseActionsMenu } from './RoadmapCourseActionsMenu';

interface Props {
  course: RoadmapCourse;
  semesterCount: number;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
  onViewCourse?: (courseId: string) => void;
}

export default function RoadmapCourseCard({ course, semesterCount, onMove, onRemove, onViewCourse }: Props) {
  const isMilestone = !!course.milestone;
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const openDetail = () => onViewCourse?.(course.courseId);

  return (
    <article
      ref={cardRef}
      data-testid="roadmap-course"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', course.id);
        const ghost = document.createElement('div');
        ghost.textContent = `${course.code} · ${course.credits}cr`;
        ghost.style.cssText =
          'position:fixed;top:-1000px;left:0;padding:8px 14px;border-radius:10px;' +
          'background:#F26F21;color:#fff;font:700 12px Inter,sans-serif;' +
          'box-shadow:0 8px 24px rgba(242,111,33,.5);white-space:nowrap;';
        document.body.appendChild(ghost);
        event.dataTransfer.setDragImage(ghost, 60, 18);
        setTimeout(() => ghost.remove(), 0);
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        'group relative cursor-grab rounded-lg border bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,24,40,0.12)] focus-within:-translate-y-0.5 focus-within:shadow-[0_8px_20px_rgba(16,24,40,0.12)]',
        'active:cursor-grabbing',
        dragging && 'rotate-2 scale-[1.03] border-brand opacity-70 shadow-[0_12px_28px_rgba(242,111,33,0.35)] ring-2 ring-brand/40',
        !dragging && isMilestone
          ? 'border-dashed border-brand/70 bg-[var(--brand-soft)] hover:border-brand'
          : !dragging && 'border-line hover:border-brand/30',
      )}
    >
      <GripVertical
        aria-hidden="true"
        className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-2 pl-2">
        <span className="rounded-md bg-ink-primary px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-tight text-surface-page">
          {course.code}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isMilestone && course.milestone && (
            <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              {course.milestone.badge}
            </span>
          )}
          <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-brand-ink ring-1 ring-brand/30">
            {course.credits} cr
          </span>
          <span
            title="Course Category"
            aria-label="Course Category"
            className="flex size-5 items-center justify-center rounded-md bg-[#2563EB]/15 text-[#1D4ED8]"
          >
            <Layers className="size-3" />
          </span>
        </div>
      </div>

      <h4 className="mt-2 truncate pl-2 text-[13px] font-bold text-ink-primary" title={course.name}>
        <button
          type="button"
          onClick={openDetail}
          title={`View detail of ${course.code}`}
          className="truncate text-left transition-colors hover:text-brand-ink hover:underline"
        >
          {course.name}
        </button>
      </h4>

      {course.categoryLabel && (
        <p className="mt-0.5 truncate pl-2 text-[11px] font-medium text-ink-subtle">{course.categoryLabel}</p>
      )}

      {course.specialization && (
        <p className="mt-1.5 pl-2">
          <span
            title={`Specialization: ${course.specialization}`}
            className="inline-block max-w-full truncate rounded-full bg-line-soft px-2 py-0.5 text-[10px] font-extrabold text-ink-secondary ring-1 ring-line"
          >
            {course.specialization}
          </span>
        </p>
      )}

      {isMilestone && course.milestone?.description && (
        <p className="mt-1.5 rounded-lg bg-white/70 px-2 py-1.5 text-[11px] leading-relaxed text-brand-ink">{course.milestone.description}</p>
      )}

      {isMilestone && course.milestone?.requirement && (
        <p className="mt-1.5 pl-2 text-[11px] font-bold text-brand-ink">{course.milestone.requirement}</p>
      )}

      {course.prerequisites.length > 0 && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 pl-2 text-[10px] font-medium',
            isMilestone ? 'text-[#8A5A3C]' : 'text-ink-muted',
          )}
        >
          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          <span className="truncate" title={course.prerequisites.map((p) => p.code).join(', ')}>
            Requires{' '}
            {course.prerequisites.map((p, i) => (
              <span key={p.code}>
                {i > 0 && ', '}
                {p.courseId && onViewCourse ? (
                  <button
                    type="button"
                    onClick={() => onViewCourse(p.courseId as string)}
                    title={`View detail of ${p.code}`}
                    className="font-bold transition-colors hover:text-brand-ink hover:underline"
                  >
                    {p.code}
                  </button>
                ) : (
                  <span className="font-bold">{p.code}</span>
                )}
              </span>
            ))}
          </span>
        </p>
      )}

      {(onMove || onRemove) && (
        <div className="absolute bottom-2 right-2 opacity-0 transition-all focus-within:opacity-100 group-hover:opacity-100">
          <RoadmapCourseActionsMenu
            course={course}
            semesterCount={semesterCount}
            onMove={onMove}
            onRemove={onRemove}
          />
        </div>
      )}
    </article>
  );
}
