// src/modules/management/components/curriculum/RoadmapSemesterColumn.tsx
// One semester column of the Academic Roadmap board: a header with the credit total,
// the stack of course cards, and a subtotal footer.
// Drop target gets a strong orange glow so the drag destination is unmistakable.
import { useRef, useState, type DragEvent } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import RoadmapCourseCard from './RoadmapCourseCard';
import type { RoadmapCourse, RoadmapSemester } from '../../../academic/types/roadmap';

interface Props {
  semester: RoadmapSemester;
  /** How many semester columns the board shows; the move menu lists them all. */
  semesterCount: number;
  /** True while a dragged card hovers this column. */
  isDropTarget?: boolean;
  onAdd?: (semesterNumber: number) => void;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
  /** A course card dropped into this column. */
  onDropCourse?: (courseId: string, semesterNumber: number) => void;
  /** Cross-navigation: open the CourseDetailModal for a catalogue course. */
  onViewCourse?: (courseId: string) => void;
}

export default function RoadmapSemesterColumn({
  semester,
  semesterCount,
  isDropTarget,
  onAdd,
  onMove,
  onRemove,
  onDropCourse,
  onViewCourse,
}: Props) {
  const isEmpty = semester.courses.length === 0;
  const [dragOver, setDragOver] = useState(false);
  // Counting enter/leave keeps the highlight on while the pointer travels over child cards.
  const dragDepth = useRef(0);
  const active = dragOver || isDropTarget;

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!onDropCourse) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragOver(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!onDropCourse) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragOver(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    const courseId = event.dataTransfer.getData('text/plain');
    if (courseId) onDropCourse?.(courseId, semester.number);
  };

  return (
    <section
      data-testid="semester-column"
      aria-label={`Semester ${semester.number}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border bg-white transition-all duration-200',
        active
          ? 'scale-[1.02] border-[#F26F21] shadow-[0_0_0_3px_rgba(242,111,33,0.25),0_12px_28px_rgba(242,111,33,0.25)]'
          : 'border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.06)]',
      )}
    >
      {active && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px animate-pulse rounded-2xl border-2 border-dashed border-[#F26F21]/60"
        />
      )}
      <header
        className={cn(
          'flex items-center justify-between gap-2 rounded-t-2xl border-b px-3.5 py-3 transition-colors',
          active ? 'border-orange-200 bg-gradient-to-r from-[#F26F21] to-[#e05f14] text-white' : 'border-slate-200 bg-orange-50/70',
        )}
      >
        <h3 className={cn('text-sm font-extrabold tracking-tight', active ? 'text-white' : 'text-gray-900')}>
          Semester {semester.number}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              'rounded-lg px-2 py-1 text-[11px] font-extrabold tabular-nums shadow-xs',
              active ? 'bg-white/20 text-white ring-1 ring-white/40' : 'bg-white text-gray-700 ring-1 ring-orange-200/70',
            )}
          >
            {semester.credits} cr
          </span>
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(semester.number)}
              aria-label={`Add courses to semester ${semester.number}`}
              className={cn(
                'flex size-6 items-center justify-center rounded-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                active ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-white hover:text-[#C2410C] hover:shadow-xs focus-visible:ring-[#F26F21]/40',
              )}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      <div className={cn('flex flex-1 flex-col gap-2.5 p-3 transition-colors', active && 'bg-orange-50/50')}>
        {isEmpty ? (
          <button
            type="button"
            onClick={() => onAdd?.(semester.number)}
            disabled={!onAdd}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-8 text-center transition-all',
              active
                ? 'scale-[1.01] border-[#F26F21] bg-white text-[#C2410C] shadow-[0_4px_16px_rgba(242,111,33,0.2)]'
                : 'border-slate-200 text-slate-400 hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-600',
              !onAdd && 'cursor-default hover:border-slate-200 hover:bg-transparent',
            )}
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full transition-all',
                active ? 'scale-110 bg-[#F26F21] text-white shadow-lg' : 'bg-slate-100 text-slate-400',
              )}
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-bold leading-relaxed">
              {active ? 'Release to drop here' : 'No courses yet'}
              <br />
              <span className={cn('font-medium', active ? 'text-[#C2410C]' : 'text-slate-400')}>
                {active ? `Course moves to Semester ${semester.number}` : 'Drag a course here or add one'}
              </span>
            </span>
          </button>
        ) : (
          semester.courses.map((course) => (
            <RoadmapCourseCard
              key={course.id}
              course={course}
              semesterCount={semesterCount}
              onMove={onMove}
              onRemove={onRemove}
              onViewCourse={onViewCourse}
            />
          ))
        )}
      </div>

      <footer className={cn('rounded-b-2xl border-t px-3.5 py-2.5', active ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50/50')}>
        <p className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="font-medium">Subtotal</span>
          <span className={cn('font-extrabold tabular-nums', active ? 'text-[#C2410C]' : 'text-gray-700')}>
            {semester.credits} credits
          </span>
        </p>
      </footer>
    </section>
  );
}
