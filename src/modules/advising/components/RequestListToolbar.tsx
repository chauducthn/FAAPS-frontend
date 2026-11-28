// Status tabs and the All / My Handled scope switch above the advisor ticket table.

import { Users } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisingRequestScope } from '../types/advising';

export type RequestTabKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

const TABS: { key: RequestTabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
];

/** MINE keeps the tickets the advisor holds or has replied in. */
const SCOPES: { key: AdvisingRequestScope; label: string }[] = [
  { key: 'ALL', label: 'All Requests' },
  { key: 'MINE', label: 'My Handled' },
];

const IDLE_CHIP = 'bg-white text-slate-700 ring-slate-200 hover:border-[#F26F21]/40 hover:bg-[#fff7f0] hover:text-slate-900';

interface RequestListToolbarProps {
  tab: RequestTabKey;
  scope: AdvisingRequestScope;
  onTab: (tab: RequestTabKey) => void;
  onScope: (scope: AdvisingRequestScope) => void;
}

export function RequestListToolbar({ tab, scope, onTab, onScope }: RequestListToolbarProps) {
  return (
    <>
      <div role="tablist" aria-label="Request status" className="flex flex-wrap items-center gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => onTab(t.key)}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold ring-1 ring-inset transition-all',
              tab === t.key ? 'bg-[#F26F21] text-white shadow-sm ring-[#F26F21]' : IDLE_CHIP,
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Request scope" className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Scope</span>
        {SCOPES.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={scope === s.key}
            onClick={() => onScope(s.key)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ring-1 ring-inset transition-all',
              scope === s.key ? 'bg-slate-900 text-white shadow-sm ring-slate-900' : IDLE_CHIP,
            )}
          >
            {s.key === 'MINE' && <Users className="size-3.5" aria-hidden />}
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
