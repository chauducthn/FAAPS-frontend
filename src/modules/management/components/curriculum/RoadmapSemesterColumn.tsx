// src/modules/management/components/curriculum/RoadmapSemesterColumn.tsx
// One semester column of the Academic Roadmap board: a header with the credit total,
// the stack of course cards, and a subtotal footer.
import { useRef, useState, type DragEvent } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import RoadmapCourseCard from './RoadmapCourseCard';
import type { RoadmapCourse, RoadmapSemester } from '../../../academic/types/roadmap';

interface Props {
  semester: RoadmapSemester;
  /** How many semester columns the board shows; the move menu lists them all. */
  semesterCount: number;
  onAdd?: (semesterNumber: number) => void;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
  /** A course card dropped into this column. */
  onDropCourse?: (courseId: string, semesterNumber: number) => void;
}

export default function RoadmapSemesterColumn({
  semester,
  semesterCount,
  onAdd,
  onMove,
  onRemove,
  onDropCourse,
}: Props) {
  const isEmpty = semester.courses.length === 0;
  const [dragOver, setDragOver] = useState(false);
  // Counting enter/leave keeps the highlight on while the pointer travels over child cards.
  const dragDepth = useRef(0);

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
        'flex w-[280px] shrink-0 flex-col rounded-xl border bg-white transition-colors',
        dragOver ? 'border-orange-400 ring-2 ring-orange-200' : 'border-slate-200',
      )}
    >
      <header className="flex items-center justify-between gap-2 rounded-t-xl border-b border-slate-200 bg-orange-50 px-3 py-2.5">
        <h3 className="text-[15px] font-bold tracking-tight text-gray-900">
          Semester {semester.number}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-gray-700 shadow-xs ring-1 ring-orange-100">
            {semester.credits} cr
          </span>
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(semester.number)}
              aria-label={`Add courses to semester ${semester.number}`}
              className="flex size-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {isEmpty ? (
          <button
            type="button"
            onClick={() => onAdd?.(semester.number)}
            disabled={!onAdd}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-8 text-center transition-colors',
              dragOver
                ? 'border-orange-400 bg-orange-50 text-orange-700'
                : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/40',
              !onAdd && 'cursor-default hover:border-slate-200 hover:bg-transparent',
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                dragOver ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500',
              )}
            >
              <Plus className="size-4" />
            </span>
            <span className="text-[11px] font-semibold leading-relaxed text-slate-500">
              {dragOver ? 'Drop here' : 'No courses yet'}
              <br />
              <span className="font-medium text-slate-400">
                {dragOver ? 'Release to move the course' : 'Drag a course here or add one'}
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
            />
          ))
        )}
      </div>

      <footer className="border-t border-slate-100 px-3 py-2.5">
        <p className="text-[11px] text-gray-500">
          Subtotal: <span className="font-semibold text-gray-700">{semester.credits} Source Credits</span>
        </p>
      </footer>
    </section>
  );
}
