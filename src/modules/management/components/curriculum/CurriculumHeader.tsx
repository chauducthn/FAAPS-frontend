// Compact header card for the curriculum detail (roadmap) page.
import type { ReactNode } from 'react';
import {
  Archive,
  ArrowUpRight,
  BookOpenText as BookOpenCheck,
  CalendarBlank as CalendarDays,
  Stack as Layers,
  SpinnerGap as Loader2,
  PencilSimple as Pencil,
  UploadSimple as Upload,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from '../StatusBadge';
import { ExampleSheetButton } from '../ImportCheckDialog';

interface Props {
  curriculum: {
    name: string;
    majorCode: string;
    version: string;
    status: string;
    effectiveFromSemesterCode: string;
    isCurrent: boolean;
  };
  courseCount: number;
  totalCredits: number;
  usedSemesters: number;
  isPublished: boolean;
  isUpdatingStatus: boolean;
  isPreviewingImport: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onPickFile: (file: File | undefined) => void;
  onDownloadExample: () => void;
  onPublish: () => void;
}

const secondaryBtn =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover';

export default function CurriculumHeader({
  curriculum,
  courseCount,
  totalCredits,
  usedSemesters,
  isPublished,
  isUpdatingStatus,
  isPreviewingImport,
  onEdit,
  onArchive,
  onPickFile,
  onDownloadExample,
  onPublish,
}: Props) {
  return (
    <header className="rounded-lg border border-line/80 bg-white px-5 py-4 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-ink-primary">{curriculum.name}</h1>
            <StatusBadge status={curriculum.status} />
            {curriculum.isCurrent && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-ink ring-1 ring-inset ring-brand/25">
                Current
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand-ink ring-1 ring-inset ring-brand/25">
              {curriculum.majorCode}
            </span>
            <span className="rounded-md bg-line-soft px-2 py-0.5 font-mono font-semibold text-ink-primary">
              {curriculum.version}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5 text-ink-subtle" />
              Start {curriculum.effectiveFromSemesterCode}
            </span>
            <span className="text-ink-subtle">·</span>
            <Stat icon={<Layers className="size-3.5" />} label={`${courseCount} courses`} />
            <Stat icon={<BookOpenCheck className="size-3.5" />} label={`${totalCredits} credits`} accent />
            <Stat icon={<CalendarDays className="size-3.5" />} label={`${usedSemesters} semesters`} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onEdit} className={secondaryBtn}>
            <Pencil className="size-3.5 text-ink-muted" /> Edit
          </button>
          <ExampleSheetButton
            examples={[{ label: 'Template', download: onDownloadExample }]}
            className={secondaryBtn}
          />
          <label className={cn(secondaryBtn, 'cursor-pointer', isPreviewingImport && 'pointer-events-none opacity-60')}>
            {isPreviewingImport ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5 text-ink-muted" />}
            {isPreviewingImport ? 'Reading…' : 'Import XLSX'}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={isPreviewingImport}
              onChange={(event) => {
                void onPickFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          {isPublished ? (
            <button
              type="button"
              onClick={onArchive}
              disabled={isUpdatingStatus}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 px-3 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <Archive className="size-3.5" /> Archive
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={onPublish}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" /> : <>Publish <ArrowUpRight className="size-3.5" /></>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, label, accent }: { icon: ReactNode; label: string; accent?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium tabular-nums', accent ? 'text-brand-ink' : 'text-ink-muted')}>
      {icon}
      {label}
    </span>
  );
}
