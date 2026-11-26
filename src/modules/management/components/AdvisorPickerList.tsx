import { useMemo, useState } from 'react';
import { Check, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { LoadBadge } from './LoadBadge';
import { UserInitials } from './UserInitials';
import type { AssignmentAdvisor } from '../types/admin';

interface AdvisorPickerListProps {
  advisors: AssignmentAdvisor[];
  selectedId: string;
  onSelect: (advisorId: string) => void;
  emptyText?: string;
}

export function AdvisorPickerList({
  advisors,
  selectedId,
  onSelect,
  emptyText = 'No advisors match your search.',
}: AdvisorPickerListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return advisors;
    return advisors.filter(
      (a) => a.fullName.toLowerCase().includes(term) || a.email.toLowerCase().includes(term),
    );
  }, [advisors, query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search advisor by name or email..."
          aria-label="Search advisor"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div
        role="listbox"
        aria-label="Advisors"
        className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white"
      >
        {filtered.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-xs text-gray-500">{emptyText}</p>
        ) : (
          filtered.map((a) => {
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(a.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors',
                  active ? 'bg-orange-50/80' : 'hover:bg-gray-50',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserInitials name={a.fullName} className="size-7 shrink-0 text-[11px]" />
                  <div className="min-w-0">
                    <p className={cn('truncate text-[13px] font-semibold', active ? 'text-[#C2410C]' : 'text-gray-900')}>
                      {a.fullName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{a.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <LoadBadge count={a.activeStudents} limit={a.maxAdvisees} />
                  {active && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#F26F21] text-white">
                      <Check className="size-3" weight="bold" aria-hidden />
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
