// src/modules/management/components/curriculum/CurriculumKanban.tsx
// The roadmap board of the curriculum detail page: the Kanban of semester columns
// with the drag & drop wiring, plus the loading / error / empty states of the board.

import { WarningCircle as CircleAlert, Stack as Layers, ArrowCounterClockwise as RotateCcw } from '@phosphor-icons/react';
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
  /** Downloads the example import sheet (used by the empty state). */
  onDownloadExample: () => void;
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
  onDownloadExample,
}: Props) {
  if (isLoading) return <DetailBoardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-line/80 bg-white px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink-primary">Could not load the courses of this curriculum</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
            The roadmap failed to load. Your curriculum header above is intact — retry to reload the course columns.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
        >
          <RotateCcw className="size-3.5" /> Retry loading courses
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Layers className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink-primary">This roadmap is empty</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
            Add courses to semesters to build the study plan, or import a spreadsheet to fill several semesters at once.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onAdd(1)}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
          >
            Add the first course
          </button>
          <label className="cursor-pointer rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-hover">
            Import XLSX instead
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                void onPickFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={onDownloadExample}
            className="rounded-lg px-3 py-2 text-xs font-bold text-brand-ink underline-offset-2 hover:underline"
          >
            Example sheet
          </button>
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
        <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-lg border border-line/80 bg-white p-3">
          <div className="h-8 animate-pulse rounded-lg bg-brand-soft" style={{ animationDelay: `${i * 70}ms` }} />
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-20 animate-pulse rounded-lg bg-line-soft" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
