// src/modules/learning/components/study-plan/StudyPlanBoard.tsx
// The board of the student's study plan: one column per semester plus the Course Pool
// (semester 0) for unplaced courses. Every column shares the same HTML5 drop logic.

import { useRef, useState, type DragEvent } from 'react';
import { CalendarDays, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BOARD_POOL } from '../../services/studentStudyPlanService';
import CourseCard from './CourseCard';
import type { StudyPlanColumn, ViewItem } from './types';
import { creditsOf } from './utils';

/* ---------- Board column (pool + semesters share the drop logic) ---------- */

interface ColumnProps {
  number: number;
  courses: ViewItem[];
  columnCount: number;
  isDropTarget: boolean;
  onMove: (courseId: string, semesterNumber: number) => void;
  onDropCourse: (courseId: string, semesterNumber: number) => void;
  onDragState: (n: number | null) => void;
}

function BoardColumn({
  number,
  courses,
  columnCount,
  isDropTarget,
  onMove,
  onDropCourse,
  onDragState,
}: ColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);
  const active = dragOver || isDropTarget;
  const isPool = number === BOARD_POOL;

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragOver(true);
    onDragState(number);
  };
  const handleDragOver = (event: DragEvent<HTMLElement>) => {
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
      onDragState(null);
    }
  };
  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    onDragState(null);
    const courseId = event.dataTransfer.getData('text/plain');
    if (courseId) onDropCourse(courseId, number);
  };

  return (
    <section
      data-testid={isPool ? 'course-pool' : 'semester-column'}
      aria-label={isPool ? 'Course Pool' : `Semester ${number}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border bg-white transition-all duration-200',
        active
          ? 'scale-[1.02] border-[#F26F21] shadow-[0_0_0_3px_rgba(242,111,33,0.25),0_12px_28px_rgba(242,111,33,0.25)]'
          : isPool
            ? 'border-dashed border-slate-300 shadow-[0_1px_2px_rgba(16,24,40,0.06)]'
            : 'border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.06)]',
      )}
    >
      {active && (
        <div aria-hidden className="pointer-events-none absolute -inset-px animate-pulse rounded-2xl border-2 border-dashed border-[#F26F21]/60" />
      )}
      <header
        className={cn(
          'flex items-center justify-between gap-2 rounded-t-2xl border-b px-3.5 py-3 transition-colors',
          active
            ? 'border-orange-200 bg-gradient-to-r from-[#F26F21] to-[#e05f14] text-white'
            : isPool
              ? 'border-slate-200 bg-slate-100'
              : 'border-slate-200 bg-orange-50/70',
        )}
      >
        <h3 className={cn('text-sm font-extrabold tracking-tight', active ? 'text-white' : 'text-gray-900')}>
          {isPool ? 'Course Pool' : `Semester ${number}`}
        </h3>
        <span
          className={cn(
            'rounded-lg px-2 py-1 text-[11px] font-extrabold tabular-nums shadow-xs',
            active ? 'bg-white/20 text-white ring-1 ring-white/40' : 'bg-white text-gray-700 ring-1 ring-orange-200/70',
          )}
        >
          {creditsOf(courses)} cr
        </span>
      </header>

      <div className={cn('flex min-h-24 flex-1 flex-col gap-2.5 p-3 transition-colors', active && 'bg-orange-50/50')}>
        {courses.length === 0 ? (
          <div
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-8 text-center transition-all',
              active ? 'scale-[1.01] border-[#F26F21] bg-white text-[#C2410C]' : 'border-slate-200 text-slate-400',
            )}
          >
            <span className="text-[11px] font-bold leading-relaxed">
              {active ? (isPool ? 'Release to unplace' : 'Release to drop here') : isPool ? 'Pool is empty' : 'No courses yet'}
              <br />
              <span className={cn('font-medium', active ? 'text-[#C2410C]' : 'text-slate-400')}>
                {active && !isPool ? `Course moves to Semester ${number}` : 'Drag a course here'}
              </span>
            </span>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.courseId} course={course} columnCount={columnCount} onMove={onMove} />
          ))
        )}
      </div>

      <footer className={cn('rounded-b-2xl border-t px-3.5 py-2.5', active ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50/50')}>
        <p className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="font-medium">{courses.length} course{courses.length === 1 ? '' : 's'}</span>
          <span className={cn('font-extrabold tabular-nums', active ? 'text-[#C2410C]' : 'text-gray-700')}>
            {creditsOf(courses)} credits
          </span>
        </p>
      </footer>
    </section>
  );
}

/* ---------- Board (legend header + horizontally scrolling columns) ---------- */

interface BoardProps {
  columns: StudyPlanColumn[];
  columnCount: number;
  /** Total number of courses on the board (legend counter). */
  courseCount: number;
  /** Total credits placed on the board (legend counter). */
  totalCredits: number;
  /** The column currently highlighted as the drop target, or null. */
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
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)]">
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
        <div className="flex items-stretch gap-4 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4">
          {columns.map((col) => (
            <BoardColumn
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
