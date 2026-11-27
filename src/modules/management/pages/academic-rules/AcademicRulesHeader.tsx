import type { ReactNode } from 'react';
import {
  Archive, BookOpenText as BookOpenCheck, CheckCircle as CheckCircle2,
  FileX as FileWarning, SpinnerGap as Loader2, Plus, ShieldCheck, SlidersHorizontal,
} from '@phosphor-icons/react';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';
import { AdminStatTile } from '../../components/AdminStatTile';
import { ADMIN_TAB_LIST_CLASS, adminTabClass } from '../../components/AdminTabBar';

export { AcademicRulesFilterBar } from './AcademicRulesFilterBar';

export type AcademicRulesTabKey = 'rules' | 'blocks';

export function AcademicRulesSectionTabs({
  activeTab,
  onChange,
}: {
  activeTab: AcademicRulesTabKey;
  onChange: (tab: AcademicRulesTabKey) => void;
}) {
  return (
    <div role="tablist" aria-label="Academic rules sections" className={ADMIN_TAB_LIST_CLASS}>
      {(
        [
          ['rules', 'Academic Rules', ShieldCheck],
          ['blocks', 'Block & Study Limits', SlidersHorizontal],
        ] as const
      ).map(([key, label, Icon]) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={adminTabClass(active)}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

const SECONDARY_BTN_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 ' +
  'text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover ' +
  'disabled:cursor-not-allowed disabled:opacity-55';

const PRIMARY_BTN_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] ' +
  'font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

export function AcademicRulesTopBar({
  headerLeft,
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
  headerLeft?: ReactNode;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>{headerLeft}</div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onSeedFlm} disabled={isSeedingFlm} className={SECONDARY_BTN_CLASS}>
            {isSeedingFlm
              ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden />
              : <BookOpenCheck className="size-4 text-ink-muted" aria-hidden />}
            Load FLM defaults
          </button>
          <button type="button" onClick={onCreate} className={PRIMARY_BTN_CLASS}>
            <Plus className="size-4" aria-hidden /> Create rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <AdminStatTile
          icon={<ShieldCheck />}
          label="Total rules"
          value={totalItems !== undefined ? String(totalItems) : '—'}
          meta={isFetching ? 'Refreshing…' : `Page ${pageIndex + 1} / ${Math.max(1, totalPages)}`}
          tone="neutral"
          active={selectedStatus === 'ALL'}
          onClick={() => onSelectStatus('ALL')}
        />
        <AdminStatTile
          icon={<CheckCircle2 />}
          label="Active"
          value={String(activeCount)}
          meta="enforced"
          tone="success"
          active={selectedStatus === 'ACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        />
        <AdminStatTile
          icon={<FileWarning />}
          label="Draft"
          value={String(draftCount)}
          meta="ready to publish"
          tone="warning"
          active={selectedStatus === 'DRAFT'}
          onClick={() => onSelectStatus(selectedStatus === 'DRAFT' ? 'ALL' : 'DRAFT')}
        />
        <AdminStatTile
          icon={<Archive />}
          label="Archived"
          value={String(inactiveCount)}
          meta="inactive"
          tone="neutral"
          active={selectedStatus === 'INACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
        />
      </div>
    </div>
  );
}
