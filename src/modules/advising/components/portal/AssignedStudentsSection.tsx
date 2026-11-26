// Assigned students overview section with academic term tooltips for AdvisorPortal.

import { Link } from 'react-router';
import { ArrowRight, Question as HelpCircle, Warning as TriangleAlert } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AcademicStatus, AdviseeStudent } from '../../types/advising';

const STATUS_STYLES: Record<AcademicStatus, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  PROBATION: { pill: 'bg-orange-100 text-orange-900 ring-orange-300', dot: 'bg-[#F26F21]', label: 'Probation' },
  SUSPENDED: { pill: 'bg-red-100 text-red-900 ring-red-300', dot: 'bg-red-600', label: 'Suspended' },
  GRADUATED: { pill: 'bg-blue-100 text-blue-900 ring-blue-300', dot: 'bg-blue-600', label: 'Graduated' },
  WITHDRAWN: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'On leave' },
};

function TermTip({ term, tip }: { term: string; tip: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <span
        tabIndex={0}
        role="button"
        aria-label={`${term}: ${tip}`}
        className="inline-flex cursor-help items-center gap-0.5 rounded-full px-0.5 text-slate-600 outline-none hover:text-[#F26F21] focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
      >
        <HelpCircle className="size-4" aria-hidden />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-left text-sm font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="mb-0.5 block text-xs font-bold uppercase tracking-wide text-orange-200">{term}</span>
        {tip}
      </span>
    </span>
  );
}

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

interface AssignedStudentsSectionProps {
  totalStudents: number;
  atRiskCount: number;
  topStudents: AdviseeStudent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  requiredCreditsFor: (student: AdviseeStudent) => number | null | undefined;
  defaultRequiredCredits: number;
}

export function AssignedStudentsSection({
  totalStudents,
  atRiskCount,
  topStudents,
  isLoading,
  isError,
  onRetry,
  requiredCreditsFor,
  defaultRequiredCredits,
}: AssignedStudentsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900">
            Assigned Students
            <TermTip
              term="Cohort"
              tip="Cohort = khóa/lứa nhập học của sinh viên (ví dụ K17, K18). Sinh viên cùng cohort học cùng chương trình đào tạo."
            />
          </h2>
          <p className="mt-1.5 text-sm font-medium text-slate-600">
            {totalStudents} students · {atRiskCount} need attention
          </p>
        </div>
        <Link
          to="/advisor/students"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
        >
          Open My Students <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
        <span className="font-bold text-slate-900">Academic terms:</span>
        <span className="inline-flex items-center gap-1">
          GPA
          <TermTip term="GPA" tip="Grade Point Average — điểm trung bình tích lũy thang 10. >= 8 Giỏi, 6.5–8 Khá, 5–6.5 Trung bình, < 5 Nguy cơ probation." />
        </span>
        <span className="inline-flex items-center gap-1">
          Probation
          <TermTip term="Probation" tip="Cảnh báo học vụ — sinh viên có GPA thấp hoặc nợ tín chỉ, cần gặp advisor sớm để lập kế hoạch cải thiện." />
        </span>
        <span className="inline-flex items-center gap-1">
          OJT
          <TermTip term="OJT" tip="On-the-Job Training — kỳ thực tập tại doanh nghiệp, thường ở năm 3. Sinh viên cần đủ tín chỉ và GPA tối thiểu." />
        </span>
        <span className="inline-flex items-center gap-1">
          Credits
          <TermTip term="Credits" tip="Tín chỉ tích lũy / tổng tín chỉ yêu cầu tốt nghiệp của chương trình đào tạo. Thanh tiến trình bên dưới mỗi thẻ cho biết % hoàn thành." />
        </span>
      </div>

      {atRiskCount > 0 && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-sm font-semibold leading-relaxed text-orange-950">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {atRiskCount} student{atRiskCount === 1 ? ' is' : 's are'} on probation/suspended — check in soon.
        </p>
      )}

      <div className="mt-6">
        {isLoading ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5">
                <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
            Could not load students.{' '}
            <button type="button" onClick={onRetry} className="h-11 font-bold underline">
              Retry
            </button>
          </div>
        ) : topStudents.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
            No students assigned yet.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topStudents.map((s) => {
              const style = STATUS_STYLES[s.academicStatus] ?? STATUS_STYLES.ACTIVE;
              const requiredCredits = requiredCreditsFor(s) ?? defaultRequiredCredits;
              const pct = Math.min(100, Math.round((s.totalCreditsEarned / requiredCredits) * 100));
              const gpaColor =
                s.currentGpa === null ? 'text-slate-600' : s.currentGpa >= 8 ? 'text-emerald-700' : s.currentGpa >= 6.5 ? 'text-orange-900' : s.currentGpa >= 5 ? 'text-amber-800' : 'text-red-700';
              return (
                <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
                  <Link to="/advisor/students" className="flex items-center gap-3 rounded-xl p-1">
                    <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-extrabold text-white shadow-sm">
                      {initialsOf(s.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-slate-900">{s.fullName ?? '—'}</span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-slate-600">
                        {s.studentCode} · {s.majorCode} · Sem {s.currentSemester}
                      </span>
                    </span>
                    <span className={cn('text-lg font-bold tabular-nums', gpaColor)}>
                      {s.currentGpa != null ? s.currentGpa.toFixed(2) : '—'}
                    </span>
                  </Link>
                  <div className="mt-3 flex items-center justify-between gap-2 px-1">
                    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-sm font-bold ring-1 ring-inset', style.pill)}>
                      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
                      {style.label}
                      {(s.academicStatus === 'PROBATION' || s.academicStatus === 'SUSPENDED') && (
                        <TermTip term={style.label} tip="Sinh viên đang bị cảnh báo/đình chỉ học vụ — ưu tiên liên hệ và lập kế hoạch hỗ trợ." />
                      )}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-600">
                      {s.totalCreditsEarned}/{requiredCredits} credits
                    </span>
                  </div>
                  <div className="mx-1 mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Credits progress ${pct}%`}>
                    <span className="block h-full rounded-full bg-[var(--brand)]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
