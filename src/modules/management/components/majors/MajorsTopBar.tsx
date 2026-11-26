import { useRef, type ReactNode } from 'react';
import { CheckCircle as CheckCircle2, Prohibit as CircleOff, NotePencil as FileEdit, FileXls as FileSpreadsheet, GraduationCap, SpinnerGap as Loader2, Plus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { ExampleSheetButton, type ExampleSheet } from '../ImportCheckDialog';

function StatTile({
  icon,
  label,
  value,
  tone,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'slate' | 'emerald' | 'amber' | 'gray';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-100 text-gray-500',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    amber: 'border-amber-400/70 bg-amber-50/40',
    gray: 'border-gray-400 bg-gray-50/70',
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
        <span className="mt-0.5 block text-lg font-bold leading-none tabular-nums text-gray-900">{value}</span>
      </div>
    </div>
  );
}

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
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="size-3.5 animate-spin text-gray-500" /> : <FileSpreadsheet className="size-3.5 text-gray-500" aria-hidden />}
            {isImporting ? 'Importing…' : 'Import Excel'}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
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
