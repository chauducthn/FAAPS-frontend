// src/modules/learning/components/study-plan/CourseCard.tsx
// One draggable course card of the student's study-plan board.
// The card carries the course code, credits, prerequisites and a keyboard-friendly
// semester picker (the select is the accessible alternative to drag & drop).

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BOARD_POOL } from '../../services/studentStudyPlanService';
import type { ViewItem } from './types';

interface Props {
  course: ViewItem;
  /** How many semester columns the board shows; the move menu lists them all. */
  columnCount: number;
  onMove: (courseId: string, semesterNumber: number) => void;
}

export default function CourseCard({ course, columnCount, onMove }: Props) {
  const [dragging, setDragging] = useState(false);
  const targets = [BOARD_POOL, ...Array.from({ length: columnCount }, (_, i) => i + 1)];

  return (
    <article
      data-testid="plan-course"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', course.courseId);
        const ghost = document.createElement('div');
        ghost.textContent = `${course.code} · ${course.credits}cr`;
        ghost.style.cssText =
          'position:fixed;top:-1000px;left:0;padding:8px 14px;border-radius:10px;' +
          'background:#F26F21;color:#fff;font:700 12px Inter,sans-serif;' +
          'box-shadow:0 8px 24px rgba(242,111,33,.5);white-space:nowrap;';
        document.body.appendChild(ghost);
        event.dataTransfer.setDragImage(ghost, 60, 18);
        setTimeout(() => ghost.remove(), 0);
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        'group relative cursor-grab rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,24,40,0.12)] active:cursor-grabbing',
        dragging && 'rotate-2 scale-[1.03] border-[#F26F21] opacity-70 shadow-[0_12px_28px_rgba(242,111,33,0.35)] ring-2 ring-[#F26F21]/40',
        !dragging &&
          (course.invalid
            ? 'border-red-400 bg-red-50/50 ring-1 ring-red-200 hover:border-red-500'
            : 'border-slate-200 hover:border-orange-300'),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-gray-900 px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-tight text-white">
          {course.code}
        </span>
        <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-[#9a3412] ring-1 ring-orange-200">
          {course.credits} cr
        </span>
      </div>

      <h4 className="mt-2 truncate text-[13px] font-bold text-gray-900" title={course.name}>
        {course.name}
      </h4>

      {course.prerequisites.length > 0 ? (
        <p className={cn('mt-1.5 flex items-center gap-1 text-[10px] font-medium', course.invalid ? 'text-red-700' : 'text-gray-500')}>
          <ShieldAlert className={cn('size-3 shrink-0', course.invalid ? 'text-red-500' : 'fill-amber-400 text-amber-400')} />
          <span className="truncate" title={course.prerequisites.map((p) => p.code).join(', ')}>
            Requires {course.prerequisites.map((p) => p.code).join(', ')}
          </span>
        </p>
      ) : (
        <p className="mt-1.5 text-[10px] font-medium text-gray-400">No prerequisites</p>
      )}

      {course.invalid && (
        <p className="mt-1.5 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-bold leading-relaxed text-red-800">
          Prerequisite must be in an earlier semester
        </p>
      )}

      <label className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
        <span className="sr-only">Move {course.code} to semester</span>
        <select
          value={course.semesterNumber}
          onChange={(e) => onMove(course.courseId, Number(e.target.value))}
          aria-label={`Move ${course.code} to semester`}
          className="h-7 max-w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-1.5 text-[11px] font-bold text-gray-600 outline-none transition-colors hover:border-orange-300 focus:border-[#F26F21]"
        >
          {targets.map((n) => (
            <option key={n} value={n}>
              {n === BOARD_POOL ? 'Pool' : `Sem ${n}`}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}
