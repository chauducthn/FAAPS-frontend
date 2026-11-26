import { CaretDown as ChevronDown, MagicWand as WandSparkles } from '@phosphor-icons/react';
import type { SummaryCohort } from '../types/admin';
import { assignmentSelectClass } from './AssignmentModalChrome';

export function CohortAssignModalBody({
  isBulk,
  bulkCount,
  mode,
  idleCount,
  alreadyAssignedCount,
  cohortsNeedingPool,
  majorCode,
  cohortId,
  fixedCohortId,
  majors,
  cohortOptions,
  error,
  onModeChange,
  onMajorChange,
  onCohortChange,
}: {
  isBulk: boolean;
  bulkCount: number;
  mode: 'manual' | 'auto';
  idleCount: number;
  alreadyAssignedCount: number;
  cohortsNeedingPool: number;
  majorCode: string;
  cohortId: string;
  fixedCohortId?: string;
  majors: string[];
  cohortOptions: SummaryCohort[];
  error: string | null;
  onModeChange: (next: 'manual' | 'auto') => void;
  onMajorChange: (next: string) => void;
  onCohortChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      {isBulk && (
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Assignment mode">
          <button
            type="button" role="tab" aria-selected={mode === 'manual'} onClick={() => onModeChange('manual')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'manual' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Manual
          </button>
          <button
            type="button" role="tab" aria-selected={mode === 'auto'} onClick={() => onModeChange('auto')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'auto' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <WandSparkles className="size-3.5 text-[#F26F21]" aria-hidden /> Auto-distribute
          </button>
        </div>
      )}

      {isBulk && mode === 'auto' ? (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-xs text-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-gray-900">
            <span>
              {idleCount} idle advisor{idleCount === 1 ? '' : 's'} ready
              {alreadyAssignedCount > 0 ? ` · ${alreadyAssignedCount} skipped` : ''}
            </span>
            <span className="text-[#C2410C]">
              {cohortsNeedingPool} cohort{cohortsNeedingPool === 1 ? '' : 's'} need capacity
            </span>
          </div>
          <p className="text-gray-500">
            Distributes idle advisors to cohorts with unassigned students. Already-assigned advisors are left untouched.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Major</label>
              <div className="relative">
                <select value={majorCode} disabled={!!fixedCohortId} aria-label="Major" onChange={(e) => onMajorChange(e.target.value)} className={assignmentSelectClass}>
                  <option value="">Choose a major...</option>
                  {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Cohort</label>
              <div className="relative">
                <select value={cohortId} disabled={!!fixedCohortId || !majorCode} aria-label="Cohort" onChange={(e) => onCohortChange(e.target.value)} className={assignmentSelectClass}>
                  <option value="">{majorCode ? 'Choose a cohort...' : 'Select a major first...'}</option>
                  {cohortOptions.map((c) => <option key={c.cohortId} value={c.cohortId}>{c.cohort} ({c.total} students)</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          {isBulk && (
            <p className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs text-gray-600">
              Replaces any previous cohort for all {bulkCount} selected advisor{bulkCount === 1 ? '' : 's'}.
            </p>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
