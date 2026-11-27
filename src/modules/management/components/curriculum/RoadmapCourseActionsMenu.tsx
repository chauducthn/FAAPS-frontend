import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DotsThree as MoreHorizontal, Trash as Trash2 } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { RoadmapCourse } from '../../../academic/types/roadmap';

interface Props {
  course: RoadmapCourse;
  semesterCount: number;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
}

/**
 * Per-course actions rendered in a portal with fixed positioning so the board's
 * horizontal scroll container can neither clip it nor grow extra scrollable space.
 */
export function RoadmapCourseActionsMenu({ course, semesterCount, onMove, onRemove }: Props) {
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
        className="flex size-6 items-center justify-center rounded-lg bg-white/95 text-ink-subtle shadow-xs ring-1 ring-line transition-all hover:scale-105 hover:text-brand-ink hover:ring-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
            className="z-[60] max-h-80 w-54 overflow-y-auto rounded-lg border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(16,24,40,0.18)]"
          >
            <p className="flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-xs font-bold text-ink-primary">
              <span className="rounded bg-ink-primary px-1.5 py-0.5 font-mono text-[10px] text-surface-page">{course.code}</span>
              <span className="truncate">{course.credits} cr · Sem {course.semesterNumber}</span>
            </p>
            {onMove && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-subtle">
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
                          ? 'cursor-default bg-brand text-white'
                          : 'bg-surface-page text-ink-secondary hover:bg-brand-soft-strong hover:text-brand-ink',
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
                {onMove && <div className="my-1 border-t border-line-soft" />}
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
