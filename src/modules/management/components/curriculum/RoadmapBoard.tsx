// src/modules/management/components/curriculum/RoadmapBoard.tsx
// The Academic Roadmap board: a legend toolbar and one horizontally scrolling row of
// semester columns.
import { ListTree, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import RoadmapSemesterColumn from './RoadmapSemesterColumn';
import type { RoadmapCourse, RoadmapSemester } from '../../../academic/types/roadmap';

interface Props {
  semesters: RoadmapSemester[];
  onAdd?: (semesterNumber: number) => void;
  onMove?: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove?: (course: RoadmapCourse) => void;
  /** A course card dropped into a column. */
  onDropCourse?: (courseId: string, semesterNumber: number) => void;
  /** Highlights one column as the current drop target while dragging. */
  dropTarget?: number | null;
  /** Cross-navigation: open the CourseDetailModal for a catalogue course. */
  onViewCourse?: (courseId: string) => void;
}

export default function RoadmapBoard({ semesters, onAdd, onMove, onRemove, onDropCourse, dropTarget, onViewCourse }: Props) {
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <h2 className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight text-gray-900">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)]">
            <ListTree className="size-4" />
          </span>
          Academic Roadmap
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-gray-600">
            {totalCourses} courses · {totalCredits} cr
          </span>
        </h2>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Roadmap legend">
          <LegendItem tone="core" label="Foundation" />
          <LegendItem tone="specialization" label="Chuyên ngành hẹp" />
          <LegendItem tone="prerequisite" label="Has prerequisites" />
        </ul>
      </div>

      <div className="roadmap-scroll overflow-x-auto pb-3">
        <div className="flex items-stretch gap-4 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4">
          {semesters.map((semester) => (
            <RoadmapSemesterColumn
              key={semester.number}
              semester={semester}
              semesterCount={semesters.length}
              isDropTarget={dropTarget === semester.number}
              onAdd={onAdd}
              onMove={onMove}
              onRemove={onRemove}
              onDropCourse={onDropCourse}
              onViewCourse={onViewCourse}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-gray-400">
        Tip: drag a course card onto another semester column to move it — credits and totals update instantly.
        Use the <span className="font-semibold text-gray-500">⋯</span> menu on a card for keyboard-friendly moves.
      </p>
    </section>
  );
}

/** One key of the legend: a colour swatch plus the meaning. */
function LegendItem({
  tone,
  label,
}: {
  tone: 'core' | 'specialization' | 'prerequisite';
  label: string;
}) {
  if (tone === 'prerequisite') {
    return (
      <li className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {label}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
      <span
        aria-hidden="true"
        className={cn('size-2.5 rounded-full ring-2 ring-offset-1', tone === 'core' ? 'bg-[#F26F21] ring-orange-200' : 'bg-[#7C3AED] ring-violet-200')}
      />
      {label}
    </li>
  );
}
