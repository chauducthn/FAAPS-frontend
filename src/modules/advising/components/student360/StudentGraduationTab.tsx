// src/modules/advising/components/student360/StudentGraduationTab.tsx
// The "Graduation & OJT" tab of the Student 360 modal.
// Điều kiện tốt nghiệp do BE tính sẵn: `GET /advisor/students/{studentId}/graduation-check`.
// Không còn suy ra thủ công từ progress/transcript ở client.
//
// Mọi thuộc tính được đọc an toàn: payload thiếu dữ liệu không được làm tab trắng —
// khi không có dữ liệu sẽ hiện Empty State.

import { useQuery } from '@tanstack/react-query';
import { WarningCircle as AlertCircle, Briefcase, CheckCircle as CheckCircle2, GraduationCap, Info } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { advisorService, type GraduationCheck } from '../../services/advisorService';
import { ProgressBar } from './shared';

/** The tone of the OJT row, derived from the status the backend reports. */
export type OjTone = 'todo' | 'doing' | 'done';

/** One graduation condition with its completion state. */
export interface GraduationCondition {
  label: string;
  done: boolean;
  hint: string;
}

/** The OJT status string the backend reports. */
const OJT_LABELS: Record<string, { label: string; tone: OjTone }> = {
  NOT_STARTED: { label: 'Not started', tone: 'todo' },
  IN_PROGRESS: { label: 'In progress', tone: 'doing' },
  COMPLETED: { label: 'Completed', tone: 'done' },
};

const ojtLabel = (status: string) => OJT_LABELS[status] ?? { label: status, tone: 'todo' as const };

/**
 * Builds the checklist from the backend graduation check.
 * The backend only reports the unmet prerequisites, so every condition that is not
 * listed as unmet is shown as satisfied.
 */
export function buildGraduationConditions(check: GraduationCheck): GraduationCondition[] {
  const unmet = check.unmetPrerequisites ?? [];
  const isUnmet = (needle: string) => unmet.some((item) => item.toLowerCase().includes(needle));

  const ojt = ojtLabel(check.ojtStatus);
  const creditsDone = !isUnmet('credit');

  return [
    {
      label: `Accumulate ${check.requiredCredits} credits`,
      done: creditsDone,
      hint: `${check.earnedCredits}/${check.requiredCredits} credits`,
    },
    {
      label: 'Meet every graduation condition',
      done: check.eligible,
      hint: check.eligible ? 'All conditions are satisfied' : `${unmet.length} condition(s) remaining`,
    },
    {
      label: 'Complete On-Job Training (OJT)',
      done: ojt.tone === 'done',
      hint: ojt.label,
    },
  ];
}

interface Props {
  studentId: string;
}

export default function StudentGraduationTab({ studentId }: Props) {
  const graduationQuery = useQuery({
    queryKey: ['advisor', 'graduation-check', studentId],
    queryFn: () => advisorService.getGraduationCheck(studentId),
    enabled: Boolean(studentId),
    staleTime: 1000 * 30,
  });

  const check = graduationQuery.data ?? null;

  // Chưa có dữ liệu tốt nghiệp ⇒ hiện Empty State thay vì `return null` (tab trắng).
  if (!check) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Info className="size-6" aria-hidden />
        </span>
        <p className="text-sm font-bold text-[#151c27]">No graduation data available yet</p>
        <p className="max-w-sm text-[13px] leading-relaxed text-slate-500">
          {graduationQuery.isError
            ? 'The graduation check could not be loaded. Try again in a moment.'
            : 'There is not enough information yet to build the graduation checklist for this student.'}
        </p>
      </div>
    );
  }

  const conditions = buildGraduationConditions(check);
  const ojt = ojtLabel(check.ojtStatus);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold',
          check.eligible
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800',
        )}
      >
        {check.eligible ? (
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        ) : (
          <AlertCircle className="size-4 shrink-0" aria-hidden />
        )}
        {check.eligible
          ? 'Eligible for graduation — every condition is satisfied.'
          : `Not eligible yet — ${check.unmetPrerequisites?.length ?? 0} condition(s) remaining.`}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
            <GraduationCap className="size-4 text-[#F26F21]" aria-hidden /> Credit progress
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {check.earnedCredits}
            <span className="text-sm font-medium text-slate-400">/{check.requiredCredits}</span>
          </p>
          <ProgressBar value={check.earnedCredits} max={check.requiredCredits} />
          <p className="mt-2 text-xs text-slate-500">
            Remaining: {Math.max(0, check.requiredCredits - check.earnedCredits)} credits
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
            <Briefcase className="size-4 text-[#F26F21]" aria-hidden /> OJT status
          </h3>
          <p className="mt-2 text-2xl font-bold">{ojt.label}</p>
          <p className="mt-1 text-xs text-slate-500">Reported by the graduation check</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-bold text-[#151c27]">Graduation checklist</h3>
        <ul className="mt-3 space-y-2.5">
          {conditions.map((c) => (
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
      {check.unmetPrerequisites && check.unmetPrerequisites.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <h3 className="text-sm font-bold text-red-800">Outstanding requirements</h3>
          <ul className="mt-2 space-y-1.5">
            {check.unmetPrerequisites.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-red-700">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
