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
}

export default function RoadmapBoard({ semesters, onAdd, onMove, onRemove, onDropCourse }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <ListTree className="size-4 text-[#F26F21]" />
          Academic Roadmap Structure
        </h2>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Roadmap legend">
          <LegendItem tone="mandatory" label="Mandatory" />
          <LegendItem tone="elective" label="Elective" />
          <LegendItem tone="prerequisite" label="Prereq Required" />
        </ul>
      </div>

      <div className="roadmap-scroll overflow-x-auto pb-3">
        <div className="flex items-stretch gap-4 rounded-xl bg-slate-50 p-4">
          {semesters.map((semester) => (
            <RoadmapSemesterColumn
              key={semester.number}
              semester={semester}
              semesterCount={semesters.length}
              onAdd={onAdd}
              onMove={onMove}
              onRemove={onRemove}
              onDropCourse={onDropCourse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One key of the legend: a colour swatch plus the meaning. */
function LegendItem({
  tone,
  label,
}: {
  tone: 'mandatory' | 'elective' | 'prerequisite';
  label: string;
}) {
  if (tone === 'prerequisite') {
    return (
      <li className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {label}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
      <span
        aria-hidden="true"
        className={cn('size-2.5 rounded-full', tone === 'mandatory' ? 'bg-[#F26F21]' : 'bg-[#2563EB]')}
      />
      {label}
    </li>
  );
}
