// Mobile course picker and desktop course sidebar for StudentLearningPlan.

import { cn } from '@/shared/lib/utils';
import type { CoursePlan, CurriculumCourse } from '../../../academic/services/studentAcademicService';

interface LearningPlanCourseSidebarProps {
  options: CurriculumCourse[];
  plans: CoursePlan[];
  selectedCourseId: string;
  isLoading: boolean;
  isError: boolean;
  onSelect: (courseId: string) => void;
  onRetry: () => void;
}

export function LearningPlanMobilePicker({
  options,
  selectedCourseId,
  disabled,
  onSelect,
}: {
  options: CurriculumCourse[];
  selectedCourseId: string;
  disabled: boolean;
  onSelect: (courseId: string) => void;
}) {
  return (
    <div className="lg:hidden">
      <label htmlFor="learning-plan-course" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
        Course
      </label>
      <select
        id="learning-plan-course"
        value={selectedCourseId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none focus:border-[#F26F21]"
      >
        {options.map((c) => (
          <option key={c.courseId} value={c.courseId}>
            {c.code} · {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LearningPlanCourseSidebar({
  options,
  plans,
  selectedCourseId,
  isLoading,
  isError,
  onSelect,
  onRetry,
}: LearningPlanCourseSidebarProps) {
  return (
    <section aria-label="Enrolled courses" className="hidden rounded-xl bg-white shadow-sm lg:block">
      <div className="border-b border-[#f1f5f9] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#151c27]">Your courses</h2>
        <p className="mt-0.5 text-[12px] text-[#555f6f]">
          {options.length > 0 ? `${options.length} enrolled` : 'No courses yet'}
        </p>
      </div>
      {isLoading ? (
        <ul className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </ul>
      ) : isError ? (
        <div className="p-4 text-center">
          <p className="text-[13px] font-semibold text-[#151c27]">Unable to load courses</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      ) : options.length === 0 ? (
        <p className="p-4 text-[13px] text-[#555f6f]">
          No enrolled courses yet. Once your curriculum is assigned, your courses will appear here.
        </p>
      ) : (
        <ul className="max-h-[480px] space-y-1 overflow-y-auto p-2">
          {options.map((course) => {
            const plan = plans.find((p) => p.header.courseId === course.courseId);
            const done = plan?.tasks.filter((t) => t.completed).length ?? 0;
            const total = plan?.tasks.length ?? 0;
            const selected = course.courseId === selectedCourseId;
            return (
              <li key={course.courseId}>
                <button
                  type="button"
                  onClick={() => onSelect(course.courseId)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'block w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                    selected
                      ? 'border-[#F26F21] bg-orange-50/60'
                      : 'border-transparent hover:border-[#e5e7eb] hover:bg-[#f7f8fa]',
                  )}
                >
                  <p className="text-[13px] font-bold text-[#151c27]">{course.code}</p>
                  <p className="mt-0.5 truncate text-[12px] text-[#555f6f]">{course.name}</p>
                  {plan ? (
                    <p className="mt-1 text-[11px] font-semibold text-[#F26F21]">
                      {done}/{total} completed
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#98a2b3]">No plan yet</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
