// src/modules/management/components/curriculum/RoadmapCourseCard.tsx
// One course card of the Academic Roadmap board.
// FPT logic: no Mandatory/Elective distinction — the visible track is the narrow
// specialization (Chuyên ngành hẹp, from semester 5, deep-dived in sem 7-9).
// Clicking the course name or a "Requires [code]" chip opens the CourseDetailModal.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Layers, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { RoadmapCourse } from '../../../academic/types/roadmap';

interface Props {
  course: RoadmapCourse;
  /** How many semester columns the board shows; the move menu lists them all. */
  semesterCount: number;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
  /** Cross-navigation: open the CourseDetailModal for a catalogue course. */
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
        // Custom drag ghost: an orange chip instead of the default screenshot.
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
        'group relative cursor-grab rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,24,40,0.12)] focus-within:-translate-y-0.5 focus-within:shadow-[0_8px_20px_rgba(16,24,40,0.12)]',
        'active:cursor-grabbing',
        dragging && 'rotate-2 scale-[1.03] border-[#F26F21] opacity-70 shadow-[0_12px_28px_rgba(242,111,33,0.35)] ring-2 ring-[#F26F21]/40',
        !dragging && isMilestone
          ? 'border-dashed border-[#F26F21]/70 bg-gradient-to-b from-[#FFF7ED] to-[#ffedd5]/60 hover:border-[#F26F21]'
          : !dragging && 'border-slate-200 hover:border-orange-300',
      )}
    >
      <GripVertical
        aria-hidden="true"
        className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-2 pl-2">
        <span className="rounded-md bg-gray-900 px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-tight text-white">
          {course.code}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isMilestone && course.milestone && (
            <span className="rounded-full bg-gradient-to-r from-[#F26F21] to-[#C2410C] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              {course.milestone.badge}
            </span>
          )}
          <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-[#9a3412] ring-1 ring-orange-200">
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

      <h4 className="mt-2 truncate pl-2 text-[13px] font-bold text-gray-900" title={course.name}>
        <button
          type="button"
          onClick={openDetail}
          title={`View detail of ${course.code}`}
          className="truncate text-left transition-colors hover:text-[#C2410C] hover:underline"
        >
          {course.name}
        </button>
      </h4>

      {course.categoryLabel && (
        <p className="mt-0.5 truncate pl-2 text-[11px] font-medium text-gray-400">{course.categoryLabel}</p>
      )}

      {course.specialization && (
        <p className="mt-1.5 pl-2">
          <span
            title={`Chuyên ngành hẹp: ${course.specialization}`}
            className="inline-block max-w-full truncate rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-extrabold text-violet-800 ring-1 ring-violet-200"
          >
            {course.specialization}
          </span>
        </p>
      )}

      {isMilestone && course.milestone?.description && (
        <p className="mt-1.5 rounded-lg bg-white/70 px-2 py-1.5 text-[11px] leading-relaxed text-[#7C2D12]">{course.milestone.description}</p>
      )}

      {isMilestone && course.milestone?.requirement && (
        <p className="mt-1.5 pl-2 text-[11px] font-bold text-[#C2410C]">{course.milestone.requirement}</p>
      )}

      {course.prerequisites.length > 0 && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 pl-2 text-[10px] font-medium',
            isMilestone ? 'text-[#8A5A3C]' : 'text-gray-500',
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
                    className="font-bold transition-colors hover:text-[#C2410C] hover:underline"
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
          <CourseActionsMenu
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

/**
 * Per-course actions. The menu is rendered in a portal with fixed positioning so the board's
 * horizontal scroll container can neither clip it nor grow extra scrollable space.
 */
function CourseActionsMenu({
  course,
  semesterCount,
  onMove,
  onRemove,
}: {
  course: RoadmapCourse;
  semesterCount: number;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 216;
    const height = 340;
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    const top =
      window.innerHeight - rect.bottom < height ? Math.max(8, rect.top - height) : rect.bottom + 4;
    setPos({ top, left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const semesters = Array.from({ length: semesterCount }, (_, index) => index + 1);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`More options for ${course.code}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="flex size-6 items-center justify-center rounded-lg bg-white/95 text-gray-400 shadow-xs ring-1 ring-slate-200 transition-all hover:scale-105 hover:text-[#C2410C] hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
      >
        <MoreHorizontal className="size-3.5" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className="z-[60] max-h-80 w-54 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(16,24,40,0.18)]"
          >
            <p className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-gray-900">
              <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[10px] text-white">{course.code}</span>
              <span className="truncate">{course.credits} cr · Sem {course.semesterNumber}</span>
            </p>
            {onMove && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                  Move to semester
                </p>
                <div className="grid grid-cols-3 gap-1 px-1.5 pb-1">
                  {semesters.map((number) => (
                    <button
                      key={number}
                      type="button"
                      role="menuitemradio"
                      aria-checked={number === course.semesterNumber}
                      disabled={number === course.semesterNumber}
                      onClick={() => {
                        setOpen(false);
                        onMove(course, number);
                      }}
                      className={cn(
                        'rounded-lg px-2 py-1.5 text-center text-xs font-bold tabular-nums transition-colors',
                        number === course.semesterNumber
                          ? 'cursor-default bg-[#F26F21] text-white'
                          : 'bg-slate-50 text-gray-700 hover:bg-orange-100 hover:text-[#9a3412]',
                      )}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </>
            )}
            {onRemove && (
              <>
                {onMove && <div className="my-1 border-t border-slate-100" />}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onRemove(course);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" /> Remove from curriculum
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
