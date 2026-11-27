import { useRef, type ReactNode } from 'react';
import { BookOpenText as BookOpenCheck, Prohibit as CircleOff, FileXls as FileSpreadsheet, GraduationCap, Stack as Layers, SpinnerGap as Loader2, Plus } from '@phosphor-icons/react';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';

import { ExampleSheetButton, type ExampleSheet } from '../ImportCheckDialog';
import { AdminStatTile, type AdminStatTileProps } from '../AdminStatTile';

/** Local alias kept for call sites that pass `sub`; renders the shared admin tile. */
function StatItem({ sub, ...rest }: Omit<AdminStatTileProps, 'meta'> & { sub?: ReactNode }) {
  return <AdminStatTile {...rest} meta={sub} />;
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
        icon={<Layers className="size-[18px]" />}
        label={`Total ${plural}`}
        value={totalElements !== undefined ? String(totalElements) : '—'}
        tone="neutral"
        active={!activeStatus}
        onClick={onClearAll}
      />
      <StatItem
        icon={<BookOpenCheck className="size-[18px]" />}
        label="Active"
        value={String(activeOnPage)}
        sub={`of ${shownCount}`}
        tone="success"
        active={activeStatus === 'ACTIVE'}
        onClick={() => onSelectStatus(activeStatus === 'ACTIVE' ? '' : 'ACTIVE')}
      />
      <StatItem
        icon={<CircleOff className="size-[18px]" />}
        label="Inactive"
        value={String(inactiveOnPage)}
        tone="warning"
        active={activeStatus === 'INACTIVE'}
        onClick={() => onSelectStatus(activeStatus === 'INACTIVE' ? '' : 'INACTIVE')}
      />
      <StatItem
        icon={<GraduationCap className="size-[18px]" />}
        label="Credits"
        value={String(creditsOnPage)}
        sub="shown"
        tone="brand"
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
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
          />
          <button
            type="button"
            disabled={isImportingCohort}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            {isImportingCohort
              ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden />
              : <FileSpreadsheet className="size-4 text-ink-muted" aria-hidden />}
            Import Excel
          </button>
        </>
      )}
      {kind === 'curriculum' && (
        <button
          type="button"
          disabled={disableImport}
          onClick={onOpenImport}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSpreadsheet className="size-4 text-ink-muted" aria-hidden /> Import Excel
        </button>
      )}
      <button
        type="button"
        onClick={onOpenCreate}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
