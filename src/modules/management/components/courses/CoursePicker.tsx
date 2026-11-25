import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';

export const courseRelationInputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-900 transition-all focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60';
export const courseRelationLabelClass =
  'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

/** Search-as-you-click course picker backed by the course list API. */
export function CoursePicker({
  excludeIds,
  value,
  onChange,
}: {
  excludeIds: string[];
  value: { id: string; code: string; name: string } | null;
  onChange: (course: { id: string; code: string; name: string } | null) => void;
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(text, 250);
  const { data, isFetching } = useCoursesQuery({ search: debounced || undefined, size: 8, status: 'ACTIVE' });
  const results = (data?.items ?? []).filter((c) => !excludeIds.includes(c.id));

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2">
        <span className="truncate text-[13px]">
          <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{value.code}</span>
          <span className="ml-1.5 font-semibold text-gray-700">- {value.name}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear course" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search by code or name..."
        aria-label="Search course"
        className={cn(courseRelationInputClass, 'pl-9')}
      />
      {focused && (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {results.length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-500">{isFetching ? 'Searching...' : 'No matching course'}</li>
          )}
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange({ id: c.id, code: c.code, name: c.name });
                  setText('');
                }}
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-orange-50"
              >
                <span className="font-mono font-bold text-gray-900">{c.code}</span> <span className="text-gray-600">- {c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
