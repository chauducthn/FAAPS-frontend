import { useRef, type ReactNode } from 'react';
import { CheckCircle as CheckCircle2, Prohibit as CircleOff, NotePencil as FileEdit, FileXls as FileSpreadsheet, GraduationCap, SpinnerGap as Loader2, Plus } from '@phosphor-icons/react';

import { ExampleSheetButton, type ExampleSheet } from '../ImportCheckDialog';
import { AdminStatTile } from '../AdminStatTile';

const StatTile = AdminStatTile;

export function MajorsTopBar({
  headerLeft,
  totalItems,
  activeCount,
  draftCount,
  inactiveCount,
  selectedStatus,
  isImporting,
  examples,
  onSelectStatus,
  onImportFile,
  onCreate,
}: {
  headerLeft?: ReactNode;
  totalItems?: number;
  activeCount: number;
  draftCount: number;
  inactiveCount: number;
  selectedStatus: string;
  isImporting?: boolean;
  examples: ExampleSheet[];
  onSelectStatus: (status: string) => void;
  onImportFile: (file: File | undefined) => void;
  onCreate: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>{headerLeft}</div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <ExampleSheetButton
            examples={examples}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="size-3.5 animate-spin text-ink-muted" /> : <FileSpreadsheet className="size-3.5 text-ink-muted" aria-hidden />}
            {isImporting ? 'Importing…' : 'Import Excel'}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <Plus className="size-4" /> Create major
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile
          icon={<GraduationCap className="size-4" />}
          label="Total majors"
          value={totalItems !== undefined ? String(totalItems) : '—'}
          tone="slate"
          active={selectedStatus === 'ALL'}
          onClick={() => onSelectStatus('ALL')}
        />
        <StatTile
          icon={<CheckCircle2 className="size-4" />}
          label="Active on page"
          value={String(activeCount)}
          tone="emerald"
          active={selectedStatus === 'ACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        />
        <StatTile
          icon={<FileEdit className="size-4" />}
          label="Draft on page"
          value={String(draftCount)}
          tone="amber"
          active={selectedStatus === 'DRAFT'}
          onClick={() => onSelectStatus(selectedStatus === 'DRAFT' ? 'ALL' : 'DRAFT')}
        />
        <StatTile
          icon={<CircleOff className="size-4" />}
          label="Inactive on page"
          value={String(inactiveCount)}
          tone="gray"
          active={selectedStatus === 'INACTIVE'}
          onClick={() => onSelectStatus(selectedStatus === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
        />
      </div>
    </div>
  );
}
