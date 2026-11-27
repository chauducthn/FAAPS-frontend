import { CaretDown as ChevronDown, X } from '@phosphor-icons/react';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { cn } from '@/shared/lib/utils';

export const courseRelationInputClass =
  'h-9 w-full rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-primary transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-line-soft disabled:opacity-60';
export const courseRelationLabelClass =
  'mb-1.5 block text-xs font-medium text-ink-secondary';

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
      <div className="flex h-9 items-center justify-between gap-2 rounded-lg border border-brand/30 bg-brand-soft/60 px-3">
        <span className="truncate text-[13px]">
          <span className="font-mono text-xs font-bold text-brand-ink">{value.code}</span>
          <span className="ml-1.5 font-medium text-ink-secondary">— {value.name}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear course" className="shrink-0 rounded-md p-1 text-ink-subtle hover:bg-white hover:text-ink-secondary">
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
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
}
