import { useState } from 'react';
import { CaretDown, DotsSixVertical, WarningCircle } from '@phosphor-icons/react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import { isCourseDraggable, type EffectiveCurriculumCourse } from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';
import { formatTermShort } from './curriculumPrereqRules';

interface Props {
  courses: EffectiveCurriculumCourse[];
  transcriptByCode: Map<string, TranscriptRow>;
  selectedCode: string | null;
  onSelect: (course: EffectiveCurriculumCourse) => void;
  onDragStartCourse: (course: EffectiveCurriculumCourse) => void;
  onDragEndCourse: () => void;
}

export function CurriculumBacklogTray({
  courses,
  transcriptByCode,
  selectedCode,
  onSelect,
  onDragStartCourse,
  onDragEndCourse,
}: Props) {
  const [open, setOpen] = useState(false);
  if (courses.length === 0) return null;

  const failedCount = courses.filter(
    (c) => classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'FAILED',
  ).length;
  const overdueCount = courses.length - failedCount;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-amber-200/80 bg-amber-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-amber-50/70"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <WarningCircle className="size-4 shrink-0 text-amber-600" weight="fill" />
          <span className="font-bold text-gray-900">Unpassed &amp; Due ({courses.length})</span>
          {failedCount > 0 && (
            <span className="rounded-full bg-red-100/80 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              {failedCount} failed
            </span>
          )}
          {overdueCount > 0 && (
            <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {overdueCount} not taken yet
            </span>
          )}
        </div>
        <CaretDown className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-amber-200/60 bg-white/80 p-3">
          <p className="mb-2.5 text-[11px] text-gray-500">
            Drag any card below onto a Semester tab or Block (10W / 5W / 3W) to schedule your retake or catch-up plan.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const row = transcriptByCode.get(course.code.trim().toUpperCase());
              const isFailed = classifyStatus(row) === 'FAILED';
              const draggable = isCourseDraggable(course);
              const isSelected = selectedCode === course.code;
              return (
                <div
                  key={`backlog-${course.code}`}
                  role="button"
                  tabIndex={0}
                  draggable={draggable}
                  onClick={() => onSelect(course)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(course); } }}
                  onDragStart={(e) => {
                    if (!draggable) return;
                    e.dataTransfer.setData('text/plain', course.code);
                    e.dataTransfer.effectAllowed = 'move';
                    onDragStartCourse(course);
                  }}
                  onDragEnd={onDragEndCourse}
                  className={`flex items-start justify-between gap-2 rounded-lg border bg-white px-2.5 py-2 text-left transition-all hover:border-orange-300 ${
                    draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  } ${isSelected ? 'border-[#F26F21] ring-1 ring-[#F26F21]/30' : isFailed ? 'border-red-200/80' : 'border-amber-200/70'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {draggable && <DotsSixVertical className="size-3 shrink-0 text-gray-300" />}
                      <span className="font-mono text-xs font-bold text-gray-900">{course.code}</span>
                      <span className="font-mono text-[10px] text-gray-400">{formatTermShort(course.semesterNumber)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-gray-600">{course.name}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isFailed ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {isFailed ? 'Failed' : 'Due'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
