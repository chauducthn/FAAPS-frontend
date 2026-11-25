// Form section for generating a curriculum study roadmap.

import { Route, Sparkles } from 'lucide-react';
import type { Semester } from '../../academic/services/studentAcademicService';
import type { RoadmapOrientation } from '../types/ai-student';

const MAX_GOAL = 500;
const FIELD_CLASS =
  'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]';

const ORIENTATIONS: { value: RoadmapOrientation; label: string; hint: string }[] = [
  { value: 'ACADEMIC', label: 'Academic', hint: 'Prioritize academics, high GPA, and depth' },
  { value: 'JOB', label: 'Job', hint: 'Prioritize practical courses and career skills' },
  { value: 'RESEARCH', label: 'Research', hint: 'Prioritize research courses, projects, and internships' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial', hint: 'Prioritize startup, management, and project courses' },
];

export interface RoadmapFormProps {
  goal: string;
  onGoalChange: (value: string) => void;
  maxCredits: string;
  onMaxCreditsChange: (value: string) => void;
  expectedGraduationSemesterId: string;
  onExpectedGraduationSemesterIdChange: (value: string) => void;
  orientation: RoadmapOrientation | '';
  onOrientationChange: (value: RoadmapOrientation | '') => void;
  targetGpa: string;
  onTargetGpaChange: (value: string) => void;
  semesters: Semester[];
  semestersLoading: boolean;
  semestersError: boolean;
  isGenerating: boolean;
  hasRoadmap: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function RoadmapForm({
  goal,
  onGoalChange,
  maxCredits,
  onMaxCreditsChange,
  expectedGraduationSemesterId,
  onExpectedGraduationSemesterIdChange,
  orientation,
  onOrientationChange,
  targetGpa,
  onTargetGpaChange,
  semesters,
  semestersLoading,
  semestersError,
  isGenerating,
  hasRoadmap,
  onSubmit,
}: RoadmapFormProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#151c27]">
        <Sparkles className="size-4 text-[#F26F21]" />
        Generate a Curriculum Study Roadmap
      </h2>
      <p className="mt-0.5 text-[13px] text-[#555f6f]">
        This roadmap organizes curriculum courses by semester and credit limit. Review it before submitting a study plan.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
        <div>
          <label
            htmlFor="roadmap-goal"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
          >
            Academic Goal
          </label>
          <input
            id="roadmap-goal"
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            maxLength={MAX_GOAL}
            placeholder="Example: Graduate on time with a GPA of at least 8.0"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor="roadmap-credits"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
          >
            Maximum Credits per Semester
          </label>
          <input
            id="roadmap-credits"
            value={maxCredits}
            onChange={(e) => onMaxCreditsChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            inputMode="numeric"
            placeholder="e.g. 21"
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            <Route className="size-4" />
            {isGenerating ? 'Generating...' : hasRoadmap ? 'Regenerate' : 'Generate Roadmap'}
          </button>
        </div>
      </form>

      <div className="mt-4 grid gap-3 border-t border-[#f1f5f9] pt-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="roadmap-graduation-semester"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
          >
            Expected Graduation Semester
          </label>
          <select
            id="roadmap-graduation-semester"
            value={expectedGraduationSemesterId}
            onChange={(e) => onExpectedGraduationSemesterIdChange(e.target.value)}
            disabled={semestersLoading || semesters.length === 0}
            className={`${FIELD_CLASS} disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:opacity-70`}
          >
            <option value="">
              {semestersLoading ? 'Loading semesters...' : 'Select a semester'}
            </option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>
          {semestersError && (
            <p className="mt-1 text-[11px] text-amber-700">Could not load semesters — leave this blank.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="roadmap-orientation"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
          >
            Orientation
          </label>
          <select
            id="roadmap-orientation"
            value={orientation}
            onChange={(e) => onOrientationChange(e.target.value as RoadmapOrientation | '')}
            className={FIELD_CLASS}
          >
            <option value="">Not specified</option>
            {ORIENTATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[#98a2b3]">
            {ORIENTATIONS.find((o) => o.value === orientation)?.hint ?? 'Pick the focus of your roadmap.'}
          </p>
        </div>

        <div>
          <label
            htmlFor="roadmap-target-gpa"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#555f6f]"
          >
            Target GPA (0 - 10)
          </label>
          <input
            id="roadmap-target-gpa"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={targetGpa}
            onChange={(e) => onTargetGpaChange(e.target.value)}
            placeholder="e.g. 8.0"
            className={FIELD_CLASS}
          />
          <p className="mt-1 text-[11px] text-[#98a2b3]">
            {targetGpa.trim() && (Number(targetGpa) < 0 || Number(targetGpa) > 10)
              ? 'Must be between 0 and 10.'
              : 'The GPA you aim to graduate with.'}
          </p>
        </div>
      </div>
    </section>
  );
}
