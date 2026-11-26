// Board of the student's study plan: legend header + horizontally scrolling semester columns.

import { CalendarBlank as CalendarDays, FileXls as FileSpreadsheet } from '@phosphor-icons/react';
import { StudyPlanColumnView } from './StudyPlanColumnView';
import type { StudyPlanColumn } from './types';

interface BoardProps {
  columns: StudyPlanColumn[];
  columnCount: number;
  courseCount: number;
  totalCredits: number;
  dropTarget: number | null;
  onMove: (courseId: string, semesterNumber: number) => void;
  onDragState: (n: number | null) => void;
}

export default function StudyPlanBoard({
  columns,
  columnCount,
  courseCount,
  totalCredits,
  dropTarget,
  onMove,
  onDragState,
}: BoardProps) {
  return (
    <section aria-label="Study plan board" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <h2 className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight text-gray-900">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)]">
            <CalendarDays className="size-4" />
          </span>
          Semester Board
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-gray-600">
            {courseCount} courses · {totalCredits} cr
          </span>
        </h2>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Board legend">
          <li className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
            <span aria-hidden className="size-2.5 rounded-full bg-[#F26F21] ring-2 ring-orange-200 ring-offset-1" />
            Placed
          </li>
          <li className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
            <span aria-hidden className="size-2.5 rounded-full bg-slate-300 ring-2 ring-slate-200 ring-offset-1" />
            Course Pool
          </li>
          <li className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
            <span aria-hidden className="size-2.5 rounded-full bg-red-500 ring-2 ring-red-200 ring-offset-1" />
            Prerequisite issue
          </li>
        </ul>
      </div>

      <div className="roadmap-scroll overflow-x-auto pb-3">
        <div className="flex items-stretch gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
          {columns.map((col) => (
            <StudyPlanColumnView
              key={col.number}
              number={col.number}
              courses={col.courses}
              columnCount={columnCount}
              isDropTarget={dropTarget === col.number}
              onMove={onMove}
              onDropCourse={(courseId, semesterNumber) => onMove(courseId, semesterNumber)}
              onDragState={onDragState}
            />
          ))}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] leading-relaxed text-gray-400">
        <FileSpreadsheet className="size-3.5 shrink-0" aria-hidden />
        Tip: drag a course card onto another semester column to move it — credits update instantly.
        Use the semester picker on a card for keyboard-friendly moves. Your draft is saved in this browser automatically.
      </p>
    </section>
  );
}
