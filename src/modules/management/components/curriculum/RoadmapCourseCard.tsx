// src/modules/management/components/curriculum/RoadmapCourseCard.tsx
// One course card of the Academic Roadmap board.
// A plain course renders as a white tile; a milestone (internship, capstone) renders as the
// highlighted orange card at the foot of its semester column.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Layers, MoreHorizontal, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { RoadmapCourse } from '../../../academic/types/roadmap';

interface Props {
  course: RoadmapCourse;
  /** How many semester columns the board shows; the move menu lists them all. */
  semesterCount: number;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
}

export default function RoadmapCourseCard({ course, semesterCount, onMove, onRemove }: Props) {
  const isMilestone = !!course.milestone;
  const mandatory = course.kind === 'MANDATORY';
  const [dragging, setDragging] = useState(false);

  const KindIcon = mandatory ? BookOpen : Layers;

  return (
    <article
      data-testid="roadmap-course"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', course.id);
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        'group relative cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-all',
        'hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md',
        'active:cursor-grabbing',
        dragging && 'scale-[0.98] opacity-40 shadow-none',
        isMilestone
          ? 'border-dashed border-[#F26F21]/70 bg-[#FFF4EA] hover:border-[#F26F21]'
          : 'border-slate-200 hover:border-orange-300',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[13px] font-bold tracking-tight text-gray-900">{course.code}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isMilestone && course.milestone && (
            <span className="rounded-full bg-[#C2410C] px-2 py-0.5 text-[10px] font-bold text-white">
              {course.milestone.badge}
            </span>
          )}
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {course.credits} cr
          </span>
          <span
            aria-hidden="true"
            title={mandatory ? 'Mandatory' : 'Elective'}
            className={cn(
              'flex size-5 items-center justify-center rounded',
              mandatory ? 'bg-[#F26F21]/15 text-[#C2410C]' : 'bg-[#2563EB]/15 text-[#1D4ED8]',
            )}
          >
            <KindIcon className="size-3" />
          </span>
        </div>
      </div>

      <h4 className="mt-1.5 truncate text-[13px] font-semibold text-gray-900" title={course.name}>
        {course.name}
      </h4>

      {course.categoryLabel && (
        <p className="mt-0.5 truncate text-[11px] text-gray-500">{course.categoryLabel}</p>
      )}

      {isMilestone && course.milestone?.description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#7C2D12]">{course.milestone.description}</p>
      )}

      {isMilestone && course.milestone?.requirement && (
        <p className="mt-1.5 text-[11px] font-semibold text-[#C2410C]">{course.milestone.requirement}</p>
      )}

      {course.prerequisites.length > 0 && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 text-[10px]',
            isMilestone ? 'text-[#8A5A3C]' : 'text-gray-500',
          )}
        >
          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          <span className="truncate">{course.prerequisites.map((p) => p.code).join(', ')}</span>
        </p>
      )}

      {(onMove || onRemove) && (
        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
    const width = 208;
    const height = 320;
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
        className="flex size-6 items-center justify-center rounded-md bg-white/90 text-gray-400 shadow-xs ring-1 ring-slate-200 transition-colors hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
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
            className="z-[60] max-h-80 w-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          >
            {onMove && (
              <>
                <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Move to semester
                </p>
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
                      'block w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold',
                      number === course.semesterNumber
                        ? 'cursor-default bg-slate-50 text-slate-400'
                        : 'text-gray-700 hover:bg-slate-50',
                    )}
                  >
                    Semester {number}
                  </button>
                ))}
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
                  className="block w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove from curriculum
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
