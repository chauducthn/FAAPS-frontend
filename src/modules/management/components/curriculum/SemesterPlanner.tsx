// src/components/management/curriculum/SemesterPlanner.tsx
// Courses of a curriculum grouped by recommended semester.
import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { CurriculumCourseItem } from '../../../academic/types/curriculum';

interface Props {
  courses: CurriculumCourseItem[];
  onAdd: (semesterNumber: number) => void;
  onMove: (course: CurriculumCourseItem, semesterNumber: number) => void;
  onRemove: (course: CurriculumCourseItem) => void;
}

const MIN_SEMESTERS = 9;

export default function SemesterPlanner({ courses, onAdd, onMove, onRemove }: Props) {
  const semesters = useMemo(() => {
    const last = Math.max(MIN_SEMESTERS, ...courses.map((c) => c.semesterNumber));
    return Array.from({ length: last }, (_, i) => {
      const number = i + 1;
      const items = courses.filter((c) => c.semesterNumber === number);
      return { number, items, credits: items.reduce((sum, c) => sum + c.credits, 0) };
    });
  }, [courses]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {semesters.map((semester) => (
        <section key={semester.number} data-testid="semester-card" className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
          <header className="flex items-center justify-between border-b border-gray-100 bg-[#f4f7fe] px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Semester {semester.number}</h3>
              <p className="text-[11px] text-gray-500">
                {semester.items.length} course{semester.items.length === 1 ? '' : 's'} · {semester.credits} credits
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAdd(semester.number)}
              aria-label={`Add courses to semester ${semester.number}`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:border-[#F26F21] hover:text-[#F26F21]"
            >
              <Plus className="size-3.5" /> Add courses
            </button>
          </header>
          {semester.items.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No courses in this semester yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {semester.items.map((course) => (
                <li key={course.id} data-testid="curriculum-course" className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                  <span className="min-w-0 truncate">
                    <span className="font-bold text-gray-900">{course.courseCode}</span>{' '}
                    <span className="text-gray-600">- {course.courseName}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-gray-500">{course.credits} cr</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${course.isMandatory ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                      {course.isMandatory ? 'Mandatory' : 'Elective'}
                    </span>
                    <select aria-label={`Move ${course.courseCode}`} value={semester.number}
                      onChange={(event) => onMove(course, Number(event.target.value))}
                      className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px]">
                      {Array.from({ length: 9 }, (_, index) => <option key={index + 1} value={index + 1}>Sem {index + 1}</option>)}
                    </select>
                    <button type="button" onClick={() => onRemove(course)} className="text-[10px] font-bold text-red-600">Remove</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
