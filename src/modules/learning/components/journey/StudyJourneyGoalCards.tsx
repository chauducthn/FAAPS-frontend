import { Briefcase, CalendarBlank, Flask, GraduationCap, RocketLaunch, TrendUp } from '@phosphor-icons/react';
import type { RoadmapOrientation } from '../../../ai/types/ai-student';
import { GPA_PRESETS, ORIENTATION_OPTIONS, type GraduationTermOption } from './studyJourneyHelpers';

const ORIENTATION_ICONS: Record<RoadmapOrientation, typeof Briefcase> = {
  JOB: Briefcase, ACADEMIC: GraduationCap, RESEARCH: Flask, ENTREPRENEURIAL: RocketLaunch,
};

interface Props {
  termOptions: GraduationTermOption[];
  recommendedTerm: GraduationTermOption | null;
  activeTermCode: string;
  remainingCredits: number;
  orientation: RoadmapOrientation;
  targetJobRole: string;
  roleChips: string[];
  targetGpa: number;
  onSelectTerm: (code: string) => void;
  onSelectOrientation: (v: RoadmapOrientation) => void;
  onChangeRole: (v: string) => void;
  onChangeGpa: (v: number) => void;
}

export function StudyJourneyGoalCards({
  termOptions, recommendedTerm, activeTermCode, remainingCredits,
  orientation, targetJobRole, roleChips, targetGpa,
  onSelectTerm, onSelectOrientation, onChangeRole, onChangeGpa,
}: Props) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <CalendarBlank className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">1. Expected Graduation Semester</h2>
              <p className="text-xs text-gray-500">Choose when you plan to complete your final capstone semester.</p>
            </div>
          </div>
          {recommendedTerm && (
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">
              On-track: {recommendedTerm.code}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {termOptions.map((opt) => {
            const active = opt.code === activeTermCode;
            const avgCr = remainingCredits > 0 ? Math.ceil(remainingCredits / opt.termsFromNow) : 0;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => onSelectTerm(opt.code)}
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  active ? 'border-[#F26F21] bg-orange-50/60 ring-2 ring-[#F26F21]/15' : 'border-gray-200/80 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-mono text-sm font-bold ${active ? 'text-[#C2410C]' : 'text-gray-900'}`}>{opt.code}</span>
                  {opt.recommended && (
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Best fit</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-gray-500">{opt.label}</p>
                <p className="mt-1.5 font-mono text-[10px] font-semibold text-gray-400">
                  {opt.termsFromNow} {opt.termsFromNow === 1 ? 'term' : 'terms'} · ~{avgCr} cr/term
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
            <Briefcase className="size-4.5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">2. Career &amp; Outcome Orientation</h2>
            <p className="text-xs text-gray-500">Select your post-graduation direction and target job role.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ORIENTATION_OPTIONS.map((opt) => {
            const Icon = ORIENTATION_ICONS[opt.value];
            const active = orientation === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelectOrientation(opt.value)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  active ? 'border-[#F26F21] bg-orange-50/60 ring-2 ring-[#F26F21]/15' : 'border-gray-200/80 bg-white hover:border-orange-300'
                }`}
              >
                <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-[#F26F21] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${active ? 'text-[#C2410C]' : 'text-gray-900'}`}>{opt.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{opt.hint}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label htmlFor="target-job-role" className="mb-1.5 block text-xs font-semibold text-gray-700">
            Target Job Role / Specialization Focus
          </label>
          <input
            id="target-job-role"
            type="text"
            value={targetJobRole}
            onChange={(e) => onChangeRole(e.target.value)}
            placeholder="e.g. Backend Java Engineer, IC Design Engineer, AI/ML Engineer…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roleChips.map((role) => {
              const selected = targetJobRole.trim().toLowerCase() === role.toLowerCase();
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onChangeRole(role)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    selected ? 'bg-[#F26F21] text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#C2410C]'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <TrendUp className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">3. Desired GPA Target</h2>
              <p className="text-xs text-gray-500">Set your cumulative graduation GPA goal on the 10-point scale.</p>
            </div>
          </div>
          <span className="rounded-xl bg-orange-50 px-3 py-1 font-mono text-base font-bold text-[#C2410C]">{targetGpa.toFixed(1)}</span>
        </div>

        <div className="mt-4">
          <input
            type="range" min={5.0} max={9.5} step={0.1} value={targetGpa}
            onChange={(e) => onChangeGpa(Number(e.target.value))} aria-label="Target GPA"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#F26F21]"
          />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-gray-400">
            <span>5.0</span><span>6.5</span><span>7.0</span><span>8.0</span><span>9.0</span><span>9.5</span>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {GPA_PRESETS.map((p) => {
            const active = Math.abs(targetGpa - p.value) < 0.05;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeGpa(p.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'border-[#F26F21] bg-orange-50 text-[#C2410C]' : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                }`}
              >
                <span className="font-mono font-bold">≥ {p.label}</span>
                <span className="text-[11px] opacity-75">{p.rank}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
