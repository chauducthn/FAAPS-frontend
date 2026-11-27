// Searchable prerequisite picker for Create / Edit Course modal.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlass as Search, SpinnerGap as Loader2, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { courseService } from '../../services/course.service';

export interface PrerequisiteOption {
  id: string;
  code: string;
  name: string;
}

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Code typed in the form, so the course cannot require itself. */
  excludeCode?: string;
  /** Already-known course metadata for pre-selected prerequisites (e.g. when editing). */
  initialOptions?: PrerequisiteOption[];
}

export default function PrerequisitePicker({ value, onChange, excludeCode, initialOptions = [] }: Props) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [cache, setCache] = useState<Map<string, PrerequisiteOption>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (initialOptions.length === 0) return;
    setCache((prev) => {
      if (initialOptions.every((opt) => prev.has(opt.id))) return prev;
      const next = new Map(prev);
      for (const opt of initialOptions) next.set(opt.id, opt);
      return next;
    });
  }, [initialOptions]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const poolQuery = useQuery({
    queryKey: ['courses', 'prerequisite-search', debounced],
    queryFn: () =>
      courseService.list({
        status: 'ACTIVE',
        search: debounced || undefined,
        page: 0,
        size: 30,
        sort: 'code,asc',
      }),
    staleTime: 60_000,
  });

  const fetched = useMemo<PrerequisiteOption[]>(
    () => (poolQuery.data?.items ?? []).map((c) => ({ id: c.id, code: c.code, name: c.name })),
    [poolQuery.data],
  );

  const byId = useMemo(() => {
    const map = new Map<string, PrerequisiteOption>(cache);
    for (const c of fetched) map.set(c.id, c);
    return map;
  }, [cache, fetched]);

  const excluded = (excludeCode ?? '').trim().toUpperCase();
  const qLower = query.trim().toLowerCase();
  const available = useMemo(
    () =>
      fetched.filter((c) => {
        if (value.includes(c.id) || c.code.toUpperCase() === excluded) return false;
        if (!qLower) return true;
        return c.code.toLowerCase().includes(qLower) || c.name.toLowerCase().includes(qLower);
      }),
    [fetched, value, excluded, qLower],
  );

  const selected = value
    .map((id) => byId.get(id))
    .filter((c): c is PrerequisiteOption => Boolean(c));

  const handlePick = (course: PrerequisiteOption) => {
    if (value.includes(course.id)) return;
    setCache((prev) => new Map(prev).set(course.id, course));
    onChange([...value, course.id]);
    setQuery('');
    setOpen(false);
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-label="Search prerequisite course"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search course by code or name…"
          className={cn(
            'h-9 w-full rounded-md border border-line bg-white pl-9 pr-8 text-[13px] text-ink-primary',
            'placeholder:text-ink-subtle shadow-2xs transition-colors',
            'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          )}
        />
        {poolQuery.isFetching ? (
          <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-ink-subtle" />
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear prerequisite search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-ink-subtle hover:text-ink-primary"
          >
            <X className="size-3.5" />
          </button>
        ) : null}

        {open && (
          <div
            role="listbox"
            aria-label="Prerequisite course suggestions"
            className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-lg"
          >
            {poolQuery.isLoading ? (
              <p className="px-3 py-2 text-xs text-ink-subtle">Loading courses…</p>
            ) : available.length === 0 ? (
              <p className="px-3 py-2 text-xs text-ink-subtle">
                {query.trim() ? 'No matching courses found.' : 'No more active courses available.'}
              </p>
            ) : (
              available.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(c)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-surface-hover"
                >
                  <span className="shrink-0 rounded-sm bg-line-soft px-1.5 py-0.5 font-mono font-semibold text-ink-primary">
                    {c.code}
                  </span>
                  <span className="truncate text-ink-secondary">{c.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected prerequisites">
          {selected.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-1 rounded-sm bg-brand-soft py-0.5 pl-2 pr-1 text-xs font-medium text-brand-ink ring-1 ring-inset ring-brand/25"
            >
              <span className="font-mono font-semibold">{c.code}</span>
              <span className="max-w-[180px] truncate">{c.name}</span>
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Remove ${c.code}`}
                className="rounded-sm p-0.5 hover:bg-brand-soft-strong"
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
