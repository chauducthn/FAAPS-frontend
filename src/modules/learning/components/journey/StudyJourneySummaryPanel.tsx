import {
  Briefcase,
  CalendarCheck,
  CheckCircle,
  FloppyDisk,
  GraduationCap,
  Sparkle,
  TrendUp,
  WarningCircle,
} from '@phosphor-icons/react';
import type { RoadmapOrientation } from '../../../ai/types/ai-student';
import {
  ORIENTATION_OPTIONS,
  type GpaFeasibility,
  type GraduationTermOption,
} from './studyJourneyHelpers';

interface Props {
  majorLabel: string;
  currentGpa: number | null;
  targetGpa: number;
  passedCredits: number;
  totalCredits: number;
  failedCount: number;
  selectedTerm: GraduationTermOption | null;
  orientation: RoadmapOrientation;
  targetJobRole: string;
  feasibility: GpaFeasibility;
  isSaving: boolean;
  isGenerating: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onGenerateRoadmap: () => void;
}

export function StudyJourneySummaryPanel({
  majorLabel,
  currentGpa,
  targetGpa,
  passedCredits,
  totalCredits,
  failedCount,
  selectedTerm,
  orientation,
  targetJobRole,
  feasibility,
  isSaving,
  isGenerating,
  hasUnsavedChanges,
  onSave,
  onGenerateRoadmap,
}: Props) {
  const remainingCredits = Math.max(0, totalCredits - passedCredits);
  const progressPct = totalCredits > 0 ? Math.min(100, Math.round((passedCredits / totalCredits) * 100)) : 0;
  const termsLeft = selectedTerm?.termsFromNow ?? 1;
  const avgCrPerTerm = remainingCredits > 0 ? Math.ceil(remainingCredits / Math.max(1, termsLeft)) : 0;
  const paceTone =
    avgCrPerTerm > 21
      ? { label: 'Overload (>21 cr)', cls: 'bg-red-50 text-red-700' }
      : avgCrPerTerm > 18
        ? { label: 'Heavy pace', cls: 'bg-amber-50 text-amber-700' }
        : { label: 'Comfortable', cls: 'bg-emerald-50 text-emerald-700' };

  const feasTone =
    feasibility.status === 'UNREALISTIC'
      ? 'border-red-200 bg-red-50/60 text-red-800'
      : feasibility.status === 'AMBITIOUS'
        ? 'border-amber-200 bg-amber-50/60 text-amber-900'
        : 'border-emerald-200 bg-emerald-50/60 text-emerald-900';

  const orientMeta = ORIENTATION_OPTIONS.find((o) => o.value === orientation) ?? ORIENTATION_OPTIONS[0];
  const gpaDelta = currentGpa != null ? targetGpa - currentGpa : null;

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <GraduationCap className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Journey Snapshot</h2>
              <p className="text-[11px] text-gray-500">{majorLabel}</p>
            </div>
          </div>
          {failedCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
              <WarningCircle className="size-3.5" weight="fill" /> {failedCount} failed
            </span>
          )}
        </div>

        {/* Credits progress */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-gray-500">Credits Completed</span>
            <span className="font-mono font-bold text-gray-900">
              {passedCredits}/{totalCredits} cr <span className="font-normal text-gray-400">({progressPct}%)</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#F26F21] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* 3 Target Summaries */}
        <div className="mt-4 space-y-2.5">
          <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <CalendarCheck className="size-3.5 text-[#F26F21]" /> Graduation Target
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${paceTone.cls}`}>
                {paceTone.label}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-gray-900">
              {selectedTerm ? `${selectedTerm.code} · ${selectedTerm.label}` : 'Select a graduation term'}
            </p>
            {selectedTerm && (
              <p className="mt-0.5 text-xs text-gray-500">
                {termsLeft} {termsLeft === 1 ? 'semester' : 'semesters'} left · ~{avgCrPerTerm} cr/semester ({remainingCredits} cr remaining)
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <Briefcase className="size-3.5 text-[#F26F21]" /> Career Orientation
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                {orientMeta.short}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-gray-900">
              {targetJobRole.trim() || orientMeta.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{orientMeta.hint}</p>
          </div>

          <div className={`rounded-xl border p-3 ${feasTone}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide opacity-80">
                <TrendUp className="size-3.5" /> Target GPA
              </span>
              <span className="font-mono text-xs font-bold">
                {currentGpa != null ? currentGpa.toFixed(2) : '—'} → {targetGpa.toFixed(1)}
                {gpaDelta != null && (
                  <span className="ml-1 opacity-75">
                    ({gpaDelta >= 0 ? '+' : ''}{gpaDelta.toFixed(2)})
                  </span>
                )}
              </span>
            </div>
            <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-relaxed">
              {feasibility.status === 'UNREALISTIC' ? (
                <WarningCircle className="mt-0.5 size-3.5 shrink-0" weight="fill" />
              ) : (
                <CheckCircle className="mt-0.5 size-3.5 shrink-0" weight="fill" />
              )}
              <span>{feasibility.message}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={isSaving || isGenerating}
            onClick={onSave}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:opacity-55"
          >
            <FloppyDisk className="size-4" />
            {isSaving ? 'Saving goals…' : hasUnsavedChanges ? 'Save Study Journey' : 'Saved · Update Goals'}
          </button>

          <button
            type="button"
            disabled={isSaving || isGenerating}
            onClick={onGenerateRoadmap}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-800 transition-colors hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#C2410C] disabled:opacity-55"
          >
            <Sparkle className="size-4 text-[#F26F21]" weight="fill" />
            {isGenerating ? 'Generating AI Roadmap…' : 'Save & Generate AI Roadmap'}
          </button>
        </div>
      </div>
    </aside>
  );
}
