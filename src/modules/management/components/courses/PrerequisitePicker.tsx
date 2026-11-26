// Optional prerequisites for a new course: pick any number of active courses from the course pool dropdown.
// Each picked course becomes its own requirement (group 1, 2, 3...), so all of them must be passed.
import { useQuery } from '@tanstack/react-query';
import { CaretDown as ChevronDown, X } from '@phosphor-icons/react';
import { courseService } from '../../services/course.service';
import type { CourseSummary } from '../../../academic/types/course';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Code typed in the form, so the course cannot require itself. */
  excludeCode?: string;
}

export default function PrerequisitePicker({ value, onChange, excludeCode }: Props) {
  const poolQuery = useQuery({
    queryKey: ['courses', 'prerequisite-pool'],
    queryFn: () => courseService.list({ status: 'ACTIVE', page: 0, size: 100, sort: 'code,asc' }),
    staleTime: 60_000,
  });

  const allCourses: CourseSummary[] = poolQuery.data?.items ?? [];
  const selected = value
    .map((id) => allCourses.find((c) => c.id === id))
    .filter((c): c is CourseSummary => Boolean(c));
  const excluded = (excludeCode ?? '').trim().toUpperCase();
  const available = allCourses.filter(
    (c) => !value.includes(c.id) && c.code.toUpperCase() !== excluded,
  );

  const handleSelect = (courseId: string) => {
    if (!courseId || value.includes(courseId)) return;
    onChange([...value, courseId]);
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2">
      <div className="relative">
        <select
          value=""
          aria-label="Select prerequisite course"
          disabled={poolQuery.isLoading || available.length === 0}
          onChange={(e) => handleSelect(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-[13px] text-gray-700 shadow-2xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {poolQuery.isLoading
              ? 'Loading courses…'
              : available.length === 0
                ? 'No more active courses available'
                : 'Select a course from course pool…'}
          </option>
          {available.map((c) => (
            <option key={c.id} value={c.id} className="text-gray-900">
              {c.code} — {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected prerequisites">
          {selected.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-[#9a3412] ring-1 ring-orange-200"
            >
              <span className="font-mono font-bold">{c.code}</span>
              <span className="max-w-[180px] truncate font-medium">{c.name}</span>
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Remove ${c.code}`}
                className="rounded p-0.5 hover:bg-orange-100"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
