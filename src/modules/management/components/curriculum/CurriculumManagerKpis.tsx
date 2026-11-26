import { useRef, type ReactNode } from 'react';
import { BookOpenText as BookOpenCheck, Prohibit as CircleOff, FileXls as FileSpreadsheet, GraduationCap, Stack as Layers, SpinnerGap as Loader2, Plus } from '@phosphor-icons/react';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { cn } from '@/shared/lib/utils';
import { ExampleSheetButton, type ExampleSheet } from '../ImportCheckDialog';

function StatItem({
  icon,
  label,
  value,
  sub,
  tone = 'slate',
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: 'slate' | 'emerald' | 'amber' | 'orange';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-[#C2410C]',
  } as const;
  const activeTone = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    amber: 'border-amber-400/70 bg-amber-50/40',
    orange: 'border-[#F26F21]/60 bg-orange-50/40',
  } as const;

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
          {sub && <span className="truncate text-xs text-gray-400">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export function CurriculumManagerTopBar(props: {
  kind?: CurriculumKind, headerLeft?: ReactNode, plural: string, createLabel: string,
  totalElements: number | undefined, shownCount: number, activeOnPage: number, inactiveOnPage: number,
  creditsOnPage: number, activeStatus: string, disableImport: boolean, isImportingCohort?: boolean,
  onSelectStatus: (status: string) => void, onClearAll: () => void, onOpenImport: () => void,
  cohortExamples?: ExampleSheet[], onImportCohortFile?: (file: File | undefined) => void, onOpenCreate: () => void,
}) {
  const { kind, headerLeft, plural, createLabel, totalElements, shownCount, activeOnPage, inactiveOnPage, creditsOnPage, activeStatus, disableImport, isImportingCohort, onSelectStatus, onClearAll, onOpenImport, cohortExamples, onImportCohortFile, onOpenCreate } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const stats = (
    <div className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4">
      <StatItem
        icon={<Layers className="size-4" />}
        label={`Total ${plural}`}
        value={totalElements !== undefined ? String(totalElements) : '—'}
        tone="slate"
        active={!activeStatus}
        onClick={onClearAll}
      />
      <StatItem
        icon={<BookOpenCheck className="size-4" />}
        label="Active"
        value={String(activeOnPage)}
        sub={`of ${shownCount}`}
        tone="emerald"
        active={activeStatus === 'ACTIVE'}
        onClick={() => onSelectStatus(activeStatus === 'ACTIVE' ? '' : 'ACTIVE')}
      />
      <StatItem
        icon={<CircleOff className="size-4" />}
        label="Inactive"
        value={String(inactiveOnPage)}
        tone="amber"
        active={activeStatus === 'INACTIVE'}
        onClick={() => onSelectStatus(activeStatus === 'INACTIVE' ? '' : 'INACTIVE')}
      />
      <StatItem
        icon={<GraduationCap className="size-4" />}
        label="Credits"
        value={String(creditsOnPage)}
        sub="shown"
        tone="orange"
      />
    </div>
  );

  const actions = (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {kind === 'cohort' && cohortExamples && onImportCohortFile && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              onImportCohortFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <ExampleSheetButton
            examples={cohortExamples}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
          />
          <button
            type="button"
            disabled={isImportingCohort}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isImportingCohort ? <Loader2 className="size-3.5 animate-spin text-gray-500" /> : <FileSpreadsheet className="size-3.5 text-gray-500" aria-hidden />}
            {isImportingCohort ? 'Importing…' : 'Import Excel'}
          </button>
        </>
      )}
      {kind === 'curriculum' && (
        <button
          type="button"
          disabled={disableImport}
          onClick={onOpenImport}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSpreadsheet className="size-4 text-gray-500" aria-hidden /> Import Excel
        </button>
      )}
      <button
        type="button"
        onClick={onOpenCreate}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
      >
        <Plus className="size-4" aria-hidden /> {createLabel}
      </button>
    </div>
  );

  if (headerLeft) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>{headerLeft}</div>
          {actions}
        </div>
        {stats}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      {stats}
      {actions}
    </div>
  );
}
