// src/modules/management/components/curriculum/CurriculumHeader.tsx
// The header card of the curriculum detail page: identity, status, stats and the
// action buttons (Edit / Archive / Import XLSX / Publish).

import type { ReactNode } from 'react';
import {
  Archive,
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  GraduationCap,
  Layers,
  Loader2,
  Pencil,
  Upload,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from '../StatusBadge';

interface Props {
  /** The curriculum identity shown in the header. */
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
  /** A published (ACTIVE) curriculum cannot be archived or edited. */
  isPublished: boolean;
  isUpdatingStatus: boolean;
  isPreviewingImport: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onPickFile: (file: File | undefined) => void;
  onPublish: () => void;
}

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
  onPublish,
}: Props) {
  return (
    <header className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="h-1.5 bg-gradient-to-r from-[#F26F21] via-[#f97316] to-[#C2410C]" />
      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <GraduationCap className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-gray-900">{curriculum.name}</h1>
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${curriculum.name}`}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-orange-50 hover:text-[#C2410C]"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-medium text-gray-500">
              <StatusBadge status={curriculum.status} />
              <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono font-bold text-white">
                {curriculum.majorCode}_{curriculum.version}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3 text-gray-400" />
                Start {curriculum.effectiveFromSemesterCode}
              </span>
              {curriculum.isCurrent && (
                <span className="rounded-full bg-orange-100 px-2 py-px font-bold text-[#9a3412]">Current version</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Stat icon={<Layers className="size-3.5" />} label={`${courseCount} courses`} />
              <Stat icon={<BookOpenCheck className="size-3.5" />} label={`${totalCredits} credits`} accent />
              <Stat icon={<CalendarDays className="size-3.5" />} label={`${usedSemesters} semesters used`} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]"
          >
            <Pencil className="size-3.5" /> Edit Draft
          </button>
          <button
            type="button"
            onClick={onArchive}
            disabled={!isPublished}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Archive className="size-3.5" /> Archive
          </button>
          <label
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]',
              isPreviewingImport && 'pointer-events-none opacity-60',
            )}
          >
            {isPreviewingImport ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {isPreviewingImport ? 'Reading…' : 'Import XLSX'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={isPreviewingImport}
              onChange={(event) => {
                void onPickFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            disabled={isPublished || isUpdatingStatus}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" /> : <>Publish Version <ArrowUpRight className="size-3.5" /></>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, label, accent }: { icon: ReactNode; label: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tabular-nums ring-1',
        accent ? 'bg-orange-50 text-[#9a3412] ring-orange-200' : 'bg-gray-100 text-gray-600 ring-gray-200',
      )}
    >
      {icon}
      {label}
    </span>
  );
}
