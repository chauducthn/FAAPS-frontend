// At-risk students widget for the Advisor Dashboard.

import { Warning as AlertTriangle, CheckCircle as CheckCircle2 } from '@phosphor-icons/react';
import { useAtRiskStudents } from '../hooks/queries/useAtRiskStudents';
import { AtRiskCard, RiskSkeleton } from './AtRiskStudentCard';

interface AtRiskStudentsWidgetProps {
  /** Opens Student 360 Modal for the selected student. */
  onViewDetail: (studentId: string) => void | Promise<void>;
}

export function AtRiskStudentsWidget({ onViewDetail }: AtRiskStudentsWidgetProps) {
  const { data, isLoading, isError, refetch } = useAtRiskStudents();

  const students = data?.data ?? [];
  const total = data?.total ?? students.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <AlertTriangle className="size-5 text-[#F26F21]" aria-hidden />
          At-risk students
        </h2>
        {!isLoading && !isError && total > 0 && (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#F26F21] px-2.5 text-xs font-extrabold tabular-nums text-white">
            {total}
          </span>
        )}
      </div>

      <div className="mt-5">
        {isLoading ? (
          <RiskSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
            Unable to load the at-risk student list.{' '}
            <button type="button" onClick={() => void refetch()} className="h-11 font-bold underline">
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
            No students are currently flagged
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <AtRiskCard key={student.id} student={student} onViewDetail={onViewDetail} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
