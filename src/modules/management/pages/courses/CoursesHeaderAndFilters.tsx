import type { ReactNode } from 'react';
import { BookOpenCheck, GraduationCap, Layers, Loader2, Plus, Upload } from 'lucide-react';
import { ExampleSheetButton, type ExampleSheet } from '../../components/ImportCheckDialog';

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = 'gray',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: 'gray' | 'green' | 'orange';
}) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-[#C2410C]',
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-lg font-extrabold tabular-nums leading-tight text-gray-900">
          {value} <span className="text-[11px] font-medium text-gray-400">{hint}</span>
        </p>
      </div>
    </div>
  );
}

export function CoursesHeader({
  examples,
  importing,
  importOpen,
  onPickFile,
  onCreate,
}: {
  examples: ExampleSheet[];
  importing: boolean;
  importOpen: boolean;
  onPickFile: (file: File | undefined) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
          <GraduationCap className="size-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Courses</h1>
          <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
            Master catalogue of all courses the system knows about — click a course to see its syllabus and prerequisites
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ExampleSheetButton examples={examples} />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]">
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Create Course
        </button>
      </div>
    </div>
  );
}

export function CoursesKpiStrip({
  totalItems,
  isFetching,
  pageIndex,
  totalPages,
  activeOnPage,
  shownCount,
  creditsOnPage,
}: {
  totalItems: number;
  isFetching: boolean;
  pageIndex: number;
  totalPages: number;
  activeOnPage: number;
  shownCount: number;
  creditsOnPage: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Kpi
        icon={<Layers className="size-4" />}
        label="Total courses"
        value={String(totalItems || '—')}
        hint={isFetching ? 'Refreshing…' : `Page ${pageIndex + 1} of ${Math.max(1, totalPages)}`}
      />
      <Kpi icon={<BookOpenCheck className="size-4" />} label="Active on this page" value={String(activeOnPage)} hint={`${shownCount} shown`} tone="green" />
      <Kpi icon={<GraduationCap className="size-4" />} label="Credits on this page" value={String(creditsOnPage)} hint="Sum of credits" tone="orange" />
    </div>
  );
}
