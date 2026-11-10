// src/modules/advising/components/student360/StudentGraduationTab.tsx
// The "Graduation & OJT" tab of the Student 360 modal.
// The graduation check is derived from the student progress + transcript — the
// backend exposes no dedicated graduation-check endpoint yet.

import { AlertCircle, Briefcase, CheckCircle2, GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AdvisorStudentDetail } from '../../services/advisorService';
import { ProgressBar } from './shared';

/** The tone of the OJT row, derived from the transcript. */
export type OjTone = 'todo' | 'doing' | 'done';

/** The OJT row found in the transcript (may be missing). */
export interface OjTRow {
  courseCode: string;
  courseName: string;
  semesterCode: string;
}
/** One graduation condition with its completion state. */
export interface GraduationCondition {
  label: string;
  done: boolean;
  hint: string;
}

/** The derived graduation data the tab renders. */
export interface GraduationSummary {
  ojtRow: OjTRow | null;
  ojtStatus: { label: string; tone: OjTone };
  conditions: GraduationCondition[];
}

/**
 * Derives the graduation summary from the student detail:
 * credits, GPA, the OJT course status and the probation state.
 */
export function buildGraduationSummary(detail: AdvisorStudentDetail): GraduationSummary | null {
  const { progress, transcript } = detail;
  const ojtRow = transcript.find((t) => t.courseCode === 'OJT401') ?? null;
  const ojtStatus =
    !ojtRow || ojtRow.status === 'NOT_STARTED'
      ? { label: 'Not started', tone: 'todo' as const }
      : ojtRow.status === 'IN_PROGRESS'
        ? { label: 'In progress', tone: 'doing' as const }
        : { label: 'Completed', tone: 'done' as const };
  const gpa = progress.currentGpa ?? 0;
  const conditions: GraduationCondition[] = [
    {
      label: 'Accumulate 132 credits',
      done: progress.earnedCredits >= progress.requiredCredits,
      hint: `${progress.earnedCredits}/${progress.requiredCredits} credits`,
    },
    {
      label: 'Maintain GPA ≥ 5.00 / 10',
      done: gpa >= 5,
      hint: `Current ${gpa.toFixed(2)}`,
    },
    {
      label: 'Complete On-Job Training (OJT401)',
      done: ojtStatus.tone === 'done',
      hint: ojtStatus.label,
    },
    {
      label: 'No unresolved probation',
      done: detail.profile.academicStatus !== 'PROBATION' && detail.profile.academicStatus !== 'SUSPENDED',
      hint: detail.profile.academicStatus ?? '—',
    },
  ];
  return { ojtRow, ojtStatus, conditions };
}

interface Props {
  detail: AdvisorStudentDetail;
  graduation: GraduationSummary | null;
}

export default function StudentGraduationTab({ detail, graduation }: Props) {
  if (!graduation) return null;

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Graduation check is derived from the student&apos;s progress and transcript — the
        backend has no dedicated graduation-check endpoint yet.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
            <GraduationCap className="size-4 text-[#F26F21]" aria-hidden /> Credit progress
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {detail.progress.earnedCredits}
            <span className="text-sm font-medium text-slate-400">
              /{detail.progress.requiredCredits}
            </span>
          </p>
          <ProgressBar value={detail.progress.earnedCredits} max={detail.progress.requiredCredits} />
          <p className="mt-2 text-xs text-slate-500">
            Remaining: {Math.max(0, detail.progress.requiredCredits - detail.progress.earnedCredits)} credits
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
            <Briefcase className="size-4 text-[#F26F21]" aria-hidden /> OJT status
          </h3>
          <p className="mt-2 text-2xl font-bold">{graduation.ojtStatus.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {graduation.ojtRow
              ? `${graduation.ojtRow.courseCode} · ${graduation.ojtRow.courseName} · ${graduation.ojtRow.semesterCode}`
              : 'No OJT course found in transcript'}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-bold text-[#151c27]">Graduation checklist</h3>
        <ul className="mt-3 space-y-2.5">
          {graduation.conditions.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 text-sm">
              {c.done ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#F26F21]" aria-hidden />
              )}
              <div>
                <p className={cn('font-medium', c.done ? 'text-[#151c27]' : 'text-slate-600')}>
                  {c.label}
                </p>
                <p className="text-xs text-slate-400">{c.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
