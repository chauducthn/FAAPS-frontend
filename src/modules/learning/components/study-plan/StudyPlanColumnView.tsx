// Single semester or Course Pool column with HTML5 drag-and-drop handling.

import { useRef, useState, type DragEvent } from 'react';
import { cn } from '@/shared/lib/utils';
import { BOARD_POOL } from '../../services/studentStudyPlanService';
import CourseCard from './CourseCard';
import type { ViewItem } from './types';
import { creditsOf } from './utils';

interface StudyPlanColumnViewProps {
  number: number;
  courses: ViewItem[];
  columnCount: number;
  isDropTarget: boolean;
  onMove: (courseId: string, semesterNumber: number) => void;
  onDropCourse: (courseId: string, semesterNumber: number) => void;
  onDragState: (n: number | null) => void;
}

export function StudyPlanColumnView({
  number,
  courses,
  columnCount,
  isDropTarget,
  onMove,
  onDropCourse,
  onDragState,
}: StudyPlanColumnViewProps) {
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
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px animate-pulse rounded-2xl border-2 border-dashed border-[#F26F21]/60"
        />
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
