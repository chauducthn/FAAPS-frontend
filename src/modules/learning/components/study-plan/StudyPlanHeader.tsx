// src/modules/learning/components/study-plan/StudyPlanHeader.tsx
// Hero banner + toolbar of the student's study plan page.
// The hero shows the curriculum and the placement counters, the toolbar holds the
// search box and the Validate / Save / Export / Reset actions.

import {
  BookOpenCheck,
  Download,
  GraduationCap,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';

interface HeroProps {
  majorCode: string;
  curriculumName: string;
  placedCount: number;
  totalCount: number;
  totalCredits: number;
  validated: boolean;
  issueCount: number;
}

export function StudyPlanHero({
  majorCode,
  curriculumName,
  placedCount,
  totalCount,
  totalCredits,
  validated,
  issueCount,
}: HeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
            <GraduationCap className="size-7" aria-hidden strokeWidth={2.25} />
            Study Plan
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
            Drag courses from the pool into semesters to plan your path through {majorCode} — {curriculumName}.
            Validate before saving: prerequisites must sit in an earlier semester.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-white/20 px-2.5 py-1 ring-1 ring-white/40">
              {placedCount}/{totalCount} placed
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-1 tabular-nums ring-1 ring-white/40">
              {totalCredits} credits planned
            </span>
            {validated && issueCount === 0 && (
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 ring-1 ring-white/40">Valid plan</span>
            )}
            {issueCount > 0 && (
              <span className="rounded-full bg-red-600/90 px-2.5 py-1 ring-1 ring-white/40">
                {issueCount} issue{issueCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onValidate: () => void;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
  saving: boolean;
  validated: boolean;
  issueCount: number;
}

export function StudyPlanToolbar({
  search,
  onSearchChange,
  onValidate,
  onSave,
  onExport,
  onReset,
  saving,
  validated,
  issueCount,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <label className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30 sm:max-w-xs">
        <BookOpenCheck className="size-4 shrink-0 text-gray-400" aria-hidden />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search code or name..."
          aria-label="Search courses"
          className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onValidate}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-4 text-xs font-bold text-[#9a3412] transition-all hover:bg-orange-100"
        >
          <ShieldCheck className="size-4" /> Validate Plan
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || (validated && issueCount > 0)}
          title={validated && issueCount > 0 ? 'Resolve prerequisite issues before saving' : 'Save each semester as a draft study plan'}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? 'Saving...' : 'Save Plan'}
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]"
        >
          <Download className="size-4" /> Export XLSX
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-500 transition-all hover:bg-gray-50"
          title="Clear your drag & drop draft"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}
