import { ChevronDown, X } from 'lucide-react';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { cn } from '@/shared/lib/utils';

export const courseRelationInputClass =
  'h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-900 transition-colors focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60';
export const courseRelationLabelClass =
  'mb-1.5 block text-xs font-medium text-gray-700';

/** Dropdown course picker backed by the active course pool. */
export function CoursePicker({
  excludeIds,
  value,
  onChange,
}: {
  excludeIds: string[];
  value: { id: string; code: string; name: string } | null;
  onChange: (course: { id: string; code: string; name: string } | null) => void;
}) {
  const { data, isFetching } = useCoursesQuery({ page: 0, size: 100, status: 'ACTIVE', sort: 'code,asc' });
  const results = (data?.items ?? []).filter((c) => !excludeIds.includes(c.id));

  if (value) {
    return (
      <div className="flex h-9 items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50/60 px-3">
        <span className="truncate text-[13px]">
          <span className="font-mono text-xs font-bold text-[#C2410C]">{value.code}</span>
          <span className="ml-1.5 font-medium text-gray-700">— {value.name}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear course" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value=""
        aria-label="Select course"
        disabled={isFetching && results.length === 0}
        onChange={(e) => {
          const picked = results.find((c) => c.id === e.target.value);
          if (picked) onChange({ id: picked.id, code: picked.code, name: picked.name });
        }}
        className={cn(courseRelationInputClass, 'appearance-none pr-8')}
      >
        <option value="">
          {isFetching && results.length === 0
            ? 'Loading courses…'
            : results.length === 0
              ? 'No active courses available'
              : 'Select a course…'}
        </option>
        {results.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
