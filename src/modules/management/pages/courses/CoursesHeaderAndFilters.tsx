import type { ReactNode } from 'react';
import { BookOpenCheck, GraduationCap, Layers, Loader2, Plus, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ExampleSheetButton, type ExampleSheet } from '../../components/ImportCheckDialog';

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
  tone: 'slate' | 'emerald' | 'orange';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-[#C2410C]',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    orange: 'border-[#F26F21]/60 bg-orange-50/40',
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
  onPickFile: (file: File | undefined) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
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

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <ExampleSheetButton examples={examples} />
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50">
          {importing && !importOpen ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {importing && !importOpen ? 'Reading…' : 'Import XLSX'}
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
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
        >
          <Plus className="size-4" strokeWidth={2.25} /> Create Course
        </button>
      </div>
    </div>
  );
}
