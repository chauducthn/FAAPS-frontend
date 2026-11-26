import type { ReactNode } from 'react';
import { Archive, BookOpenText as BookOpenCheck, CheckCircle as CheckCircle2, FileX as FileWarning, SpinnerGap as Loader2, Plus, ShieldCheck } from '@phosphor-icons/react';
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
  tone: 'slate' | 'emerald' | 'amber' | 'gray';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-slate-100 text-slate-600',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    amber: 'border-amber-400/70 bg-amber-50/40',
    gray: 'border-slate-400/70 bg-slate-50/50',
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
  draftCount,
  inactiveCount,
  selectedStatus,
  onSelectStatus,
  onCreate,
  onSeedFlm,
  isSeedingFlm,
}: {
  totalItems?: number;
  isFetching: boolean;
  pageIndex: number;
  totalPages: number;
  activeCount: number;
  draftCount: number;
  inactiveCount: number;
  selectedStatus: 'ALL' | AcademicRuleStatus;
  onSelectStatus: (status: 'ALL' | AcademicRuleStatus) => void;
  onCreate: () => void;
  onSeedFlm: () => void;
  isSeedingFlm: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
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
          icon={<CheckCircle2 className="size-4" />}
          label="Active"
          value={String(activeCount)}
          meta="enforced"
          tone="emerald"
          active={selectedStatus === 'ACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        />
        <StatTile
          icon={<FileWarning className="size-4" />}
          label="Draft"
          value={String(draftCount)}
          meta="ready to publish"
          tone="amber"
          active={selectedStatus === 'DRAFT'}
          onClick={() => onSelectStatus(selectedStatus === 'DRAFT' ? 'ALL' : 'DRAFT')}
        />
        <StatTile
          icon={<Archive className="size-4" />}
          label="Archived"
          value={String(inactiveCount)}
          meta="inactive"
          tone="gray"
          active={selectedStatus === 'INACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onSeedFlm}
          disabled={isSeedingFlm}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSeedingFlm ? <Loader2 className="size-4 animate-spin" /> : <BookOpenCheck className="size-4 text-[#F26F21]" />}
          {isSeedingFlm ? 'Loading FLM…' : 'Load FLM defaults'}
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
        >
          <Plus className="size-4" /> Create rule
        </button>
      </div>
    </div>
  );
}
