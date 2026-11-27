import { Archive, BookOpenText as BookOpenCheck, CheckCircle as CheckCircle2, FileX as FileWarning, SpinnerGap as Loader2, Plus, ShieldCheck } from '@phosphor-icons/react';

import { AdminTabBar } from '../../components/AdminTabBar';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';
import { AdminStatTile } from '../../components/AdminStatTile';

export { AcademicRulesFilterBar } from './AcademicRulesFilterBar';

const StatTile = AdminStatTile;

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
    <div className="space-y-4">
      <AdminTabBar
        ariaLabel="Academic rule status tabs"
        activeKey={selectedStatus}
        onChange={onSelectStatus}
        tabs={[
          { key: 'ALL', label: 'All rules', icon: ShieldCheck, count: totalItems, badgeTone: 'slate' },
          { key: 'ACTIVE', label: 'Active', icon: CheckCircle2, count: activeCount, badgeTone: 'emerald' },
          { key: 'DRAFT', label: 'Draft', icon: FileWarning, count: draftCount, badgeTone: 'amber' },
          { key: 'INACTIVE', label: 'Archived', icon: Archive, count: inactiveCount, badgeTone: 'slate' },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={onSeedFlm}
              disabled={isSeedingFlm}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:border-brand/30 hover:bg-brand-soft/50 hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSeedingFlm ? <Loader2 className="size-4 animate-spin" /> : <BookOpenCheck className="size-4 text-brand" />}
              {isSeedingFlm ? 'Loading FLM…' : 'Load FLM defaults'}
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <Plus className="size-4" /> Create rule
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
    </div>
  );
}
