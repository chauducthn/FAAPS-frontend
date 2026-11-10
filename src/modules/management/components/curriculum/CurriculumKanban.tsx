// src/modules/management/components/curriculum/CurriculumKanban.tsx
// The roadmap board of the curriculum detail page: the Kanban of semester columns
// with the drag & drop wiring, plus the loading / error / empty states of the board.

import { CircleAlert, Layers, RotateCcw } from 'lucide-react';
import RoadmapBoard from './RoadmapBoard';
import type { RoadmapCourse, RoadmapSemester } from '../../../academic/types/roadmap';

interface Props {
  semesters: RoadmapSemester[];
  isLoading: boolean;
  isError: boolean;
  /** True when the curriculum has no courses at all. */
  isEmpty: boolean;
  onAdd: (semesterNumber: number) => void;
  onMove: (course: RoadmapCourse, semesterNumber: number) => void;
  onRemove: (course: RoadmapCourse) => void;
  /** A course card dropped into another column. */
  onDropCourse: (courseId: string, semesterNumber: number) => void;
  onViewCourse: (courseId: string) => void;
  onRetry: () => void;
  /** Open the import picker (used by the empty state). */
  onPickFile: (file: File | undefined) => void;
}

export default function CurriculumKanban({
  semesters,
  isLoading,
  isError,
  isEmpty,
  onAdd,
  onMove,
  onRemove,
  onDropCourse,
  onViewCourse,
  onRetry,
  onPickFile,
}: Props) {
  if (isLoading) return <DetailBoardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">Could not load the courses of this curriculum</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
            The roadmap failed to load. Your curriculum header above is intact — retry to reload the course columns.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
        >
          <RotateCcw className="size-3.5" /> Retry loading courses
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
          <Layers className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">This roadmap is empty</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
            Add courses to semesters to build the study plan, or import a spreadsheet to fill several semesters at once.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onAdd(1)}
            className="rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
          >
            Add the first course
          </button>
          <label className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50">
            Import XLSX instead
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(event) => {
                void onPickFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <RoadmapBoard
      semesters={semesters}
      onAdd={onAdd}
      onMove={onMove}
      onRemove={onRemove}
      onDropCourse={onDropCourse}
      onViewCourse={onViewCourse}
    />
  );
}

function DetailBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden" aria-label="Loading courses">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
          <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
