import type { ReactNode } from 'react';
import { Archive, FileWarning, Plus, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';

export { AcademicRulesFilterBar } from './AcademicRulesFilterBar';

function StatTile({
  icon,
  label,
  value,
  meta,
  tone,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta?: string;
  tone: 'slate' | 'emerald' | 'amber';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    amber: 'border-amber-400/70 bg-amber-50/40',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? activeTone[tone] : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconTone[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg font-bold leading-none tabular-nums text-gray-900">{value}</span>
          {meta && <span className="truncate text-xs text-gray-400">{meta}</span>}
        </div>
      </div>
    </div>
  );
}

export function AcademicRulesTopBar({
  totalItems,
  isFetching,
  pageIndex,
  totalPages,
  activeCount,
  shownCount,
  draftCount,
  selectedStatus,
  onSelectStatus,
  onCreate,
}: {
  totalItems?: number;
  isFetching: boolean;
  pageIndex: number;
  totalPages: number;
  activeCount: number;
  shownCount: number;
  draftCount: number;
  selectedStatus: 'ALL' | AcademicRuleStatus;
  onSelectStatus: (status: 'ALL' | AcademicRuleStatus) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatTile
          icon={<ShieldCheck className="size-4" />}
          label="Total rules"
          value={totalItems !== undefined ? String(totalItems) : '—'}
          meta={isFetching ? 'Refreshing…' : `Page ${pageIndex + 1} / ${Math.max(1, totalPages)}`}
          tone="slate"
          active={selectedStatus === 'ALL'}
          onClick={() => onSelectStatus('ALL')}
        />
        <StatTile
          icon={<FileWarning className="size-4" />}
          label="Active on page"
          value={String(activeCount)}
          meta={`${shownCount} shown`}
          tone="emerald"
          active={selectedStatus === 'ACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        />
        <StatTile
          icon={<Archive className="size-4" />}
          label="Drafts on page"
          value={String(draftCount)}
          meta="ready to publish"
          tone="amber"
          active={selectedStatus === 'DRAFT'}
          onClick={() => onSelectStatus(selectedStatus === 'DRAFT' ? 'ALL' : 'DRAFT')}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
        >
          <Plus className="size-4" strokeWidth={2.25} /> Create rule
        </button>
      </div>
    </div>
  );
}
