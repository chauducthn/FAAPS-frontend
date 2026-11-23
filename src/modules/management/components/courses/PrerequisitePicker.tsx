// Optional prerequisites for a new course: search the catalogue and pick any number of courses.
// Each picked course becomes its own requirement (group 1, 2, 3…), so all of them must be passed.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';
import { courseService } from '../../services/course.service';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import type { CourseSummary } from '../../../academic/types/course';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Code typed in the form, so the course cannot require itself. */
  excludeCode?: string;
}

export default function PrerequisitePicker({ value, onChange, excludeCode }: Props) {
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<CourseSummary[]>([]);
  const term = useDebounce(search.trim(), 300);

  const results = useQuery({
    queryKey: ['courses', 'prerequisite-picker', term],
    queryFn: () => courseService.list({ search: term, status: 'ACTIVE', page: 0, size: 8, sort: 'code,asc' }),
    enabled: term.length > 0,
  });

  const selected = picked.filter((c) => value.includes(c.id));
  const options = (results.data?.items ?? []).filter(
    (c) => !value.includes(c.id) && c.code.toUpperCase() !== (excludeCode ?? '').trim().toUpperCase(),
  );

  const add = (course: CourseSummary) => {
    setPicked((list) => [...list.filter((c) => c.id !== course.id), course]);
    onChange([...value, course.id]);
    setSearch('');
  };
  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected prerequisites">
          {selected.map((c) => (
            <li key={c.id} className="inline-flex items-center gap-1 rounded-lg bg-orange-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-[#9a3412] ring-1 ring-orange-200">
              <span className="font-mono font-bold">{c.code}</span>
              <span className="max-w-[180px] truncate font-medium">{c.name}</span>
              <button type="button" onClick={() => remove(c.id)} aria-label={`Remove ${c.code}`} className="rounded p-0.5 hover:bg-orange-100">
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a course by code or name…"
          aria-label="Search prerequisite course"
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
        />
        {term && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg" role="listbox" aria-label="Matching courses">
            {results.isFetching && !results.data ? (
              <p className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <Loader2 className="size-3.5 animate-spin" /> Searching…
              </p>
            ) : options.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500">No active course matches “{term}”.</p>
            ) : (
              options.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => add(c)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-orange-50"
                >
                  <span className="font-mono font-bold text-gray-900">{c.code}</span>
                  <span className="truncate text-gray-600">{c.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
