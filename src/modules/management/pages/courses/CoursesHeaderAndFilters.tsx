import { BookOpenText as BookOpenCheck, Prohibit as CircleOff, FileXls as FileSpreadsheet, GraduationCap, Stack as Layers, SpinnerGap as Loader2, Plus } from '@phosphor-icons/react';

import { AdminTabBar } from '../../components/AdminTabBar';
import { ExampleSheetButton, type ExampleSheet } from '../../components/ImportCheckDialog';
import { AdminStatTile } from '../../components/AdminStatTile';

const StatTile = AdminStatTile;

export function CoursesTopBar({
  totalItems,
  isFetching,
  pageIndex,
  totalPages,
  activeOnPage,
  shownCount,
  creditsOnPage,
  activeStatus,
  examples,
  importing,
  importOpen,
  onToggleActive,
  onClearStatus,
  onSelectStatus,
  onPickFile,
  onCreate,
}: {
  totalItems?: number;
  isFetching: boolean;
  pageIndex: number;
  totalPages: number;
  activeOnPage: number;
  shownCount: number;
  creditsOnPage: number;
  activeStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  examples: ExampleSheet[];
  importing: boolean;
  importOpen: boolean;
  onToggleActive: () => void;
  onClearStatus: () => void;
  onSelectStatus?: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onPickFile: (file: File | undefined) => void;
  onCreate: () => void;
}) {
  return (
    <div className="space-y-4">
      <AdminTabBar
        ariaLabel="Course status tabs"
        activeKey={activeStatus}
        onChange={(next) => {
          if (onSelectStatus) onSelectStatus(next);
          else if (next === 'ALL') onClearStatus();
          else if (next === 'ACTIVE') onToggleActive();
        }}
        tabs={[
          { key: 'ALL', label: 'All courses', icon: Layers, count: totalItems, badgeTone: 'slate' },
          { key: 'ACTIVE', label: 'Active', icon: BookOpenCheck, badgeTone: 'emerald' },
          { key: 'INACTIVE', label: 'Inactive', icon: CircleOff, badgeTone: 'slate' },
        ]}
        actions={
          <>
            <ExampleSheetButton
              examples={examples}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
            />
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover">
              {importing && !importOpen ? <Loader2 className="size-3.5 animate-spin text-ink-muted" /> : <FileSpreadsheet className="size-3.5 text-ink-muted" aria-hidden />}
              {importing && !importOpen ? 'Reading…' : 'Import Excel'}
              <input
                type="file"
                accept=".xlsx,.xls"
                aria-label="Import courses from Excel"
                className="hidden"
                disabled={importing}
                onChange={(event) => {
                  onPickFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <Plus className="size-4" /> Create course
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatTile
          icon={<Layers className="size-4" />}
          label="Total courses"
          value={totalItems !== undefined ? String(totalItems) : '—'}
          meta={isFetching ? 'Refreshing…' : `Page ${pageIndex + 1} / ${Math.max(1, totalPages)}`}
          tone="slate"
          active={activeStatus === 'ALL'}
          onClick={onClearStatus}
        />
        <StatTile
          icon={<BookOpenCheck className="size-4" />}
          label="Active on page"
          value={String(activeOnPage)}
          meta={`${shownCount} shown`}
          tone="emerald"
          active={activeStatus === 'ACTIVE'}
          onClick={onToggleActive}
        />
        <StatTile
          icon={<GraduationCap className="size-4" />}
          label="Credits on page"
          value={String(creditsOnPage)}
          meta="sum of credits"
          tone="orange"
        />
      </div>
    </div>
  );
}
