import { BookOpen, MagnifyingGlass, WarningCircle, X } from '@phosphor-icons/react';
import { DRAFT_SEM } from './curriculumDraftHelpers';

interface Props {
  curriculumName?: string;
  currentGpa: number | null;
  totalCourses: number;
  passedCredits: number;
  totalCredits: number;
  currentTabSem?: number;
  currentTabCoursesCount: number;
  currentTabCredits: number;
  overLimit: boolean;
  maxCoursesLimit: number;
  maxCreditsLimit: number;
  currentSem: number;
  draftCount: number;
  isSaving: boolean;
  showControls: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onLoadDefaultDraft: () => void;
  onClearDraft: () => void;
}

export function CurriculumCardHeader({
  curriculumName, currentGpa, totalCourses, passedCredits, totalCredits,
  currentTabSem, currentTabCoursesCount, currentTabCredits, overLimit,
  maxCoursesLimit, maxCreditsLimit, currentSem, draftCount, isSaving,
  showControls, search, onSearchChange, onLoadDefaultDraft, onClearDraft,
}: Props) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
          <BookOpen className="size-4.5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {curriculumName && <span className="text-sm font-bold text-gray-900">{curriculumName}</span>}
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#C2410C]">
              GPA {currentGpa != null ? currentGpa.toFixed(2) : '—'}
            </span>
            {overLimit && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                <WarningCircle className="size-3.5" weight="fill" /> {currentTabCoursesCount}/{maxCoursesLimit} · {currentTabCredits}/{maxCreditsLimit} cr
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-500">
            {totalCourses} courses · <span className="font-semibold text-gray-700">{passedCredits}/{totalCredits}</span> credits passed
          </p>
        </div>
      </div>
      {showControls && (
        <div className="flex flex-wrap items-center gap-2">
          {currentTabSem === DRAFT_SEM && (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={onLoadDefaultDraft}
                className="inline-flex h-8 items-center rounded-lg border border-orange-200 bg-white px-2.5 text-[11px] font-semibold text-[#C2410C] transition-colors hover:bg-orange-50 disabled:opacity-50"
              >
                Load Sem {currentSem}
              </button>
              <button
                type="button"
                disabled={isSaving || draftCount === 0}
                onClick={onClearDraft}
                className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-600 transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                Clear Draft
              </button>
            </>
          )}
          <div className="relative w-48 sm:w-56">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search all courses..."
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pr-7 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none"
            />
            {search && (
              <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
