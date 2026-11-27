// src/modules/advising/components/AtRiskStudentsWidget.tsx
// Widget "Sinh viên có nguy cơ" (Flow 3 — Passive warning) cho Advisor Dashboard.
// Đồng bộ style với các section/KPI trong AdvisorPortal.tsx:
// card trắng viền slate, top-bar màu theo mức độ, pill FPT cam cho CTA.
//
// Dữ liệu đến từ GET /advisor/at-risk-students (service: advisorAtRiskApi).

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAtRiskStudents } from '../hooks/queries/useAtRiskStudents';
import type { AtRiskStudent, RiskLevel, RiskReason } from '../types/at-risk';

interface AtRiskStudentsWidgetProps {
  /**
   * Mở Student 360 Modal cho sinh viên tương ứng.
   * Có thể trả về Promise để widget báo trạng thái đang tải trên nút.
   */
  onViewDetail: (studentId: string) => void | Promise<void>;
}

/** Màu badge theo mức độ nguy cơ. */
const LEVEL_STYLES: Record<RiskLevel, { pill: string; bar: string; label: string }> = {
  HIGH: { pill: 'bg-red-100 text-red-900 ring-red-300', bar: 'bg-red-600', label: 'High' },
  MEDIUM: { pill: 'bg-amber-100 text-amber-900 ring-amber-300', bar: 'bg-amber-500', label: 'Medium' },
  LOW: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', bar: 'bg-emerald-600', label: 'Low' },
};

/** Nhãn + màu chip cho từng lý do bị cảnh báo. */
const REASON_STYLES: Record<RiskReason, { label: string; chip: string }> = {
  LOW_GPA: { label: 'Low GPA', chip: 'bg-orange-100 text-orange-900 ring-orange-300' },
  HIGH_ABSENCE: { label: 'High absence', chip: 'bg-purple-100 text-purple-900 ring-purple-300' },
  FAILED_COURSES: { label: 'Failed courses', chip: 'bg-red-100 text-red-900 ring-red-300' },
};

/**
 * Badge trạng thái tư vấn, dựa trên cờ BE trả về:
 *   • `hasOpenAppointment` → SV đã có lịch hẹn còn mở ⇒ "Appointment scheduled".
 *   • `hasOpenRequest`    → SV đang có yêu cầu tư vấn mở ⇒ "In advising".
 *
 * Thứ tự ưu tiên: có lịch hẹn thì hiện "Appointment scheduled" (đã hành động
 * rõ ràng hơn), nếu không mới hiện "In advising".
 */
const STATUS_STYLES = {
  appointment: {
    label: 'Appointment scheduled',
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  advising: {
    label: 'In advising',
    chip: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
} as const;

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function RiskSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

function AtRiskCard({
  student,
  onViewDetail,
}: {
  student: AtRiskStudent;
  onViewDetail: (id: string) => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const level = LEVEL_STYLES[student.riskLevel] ?? LEVEL_STYLES.LOW;

  /**
   * Trạng thái tư vấn hiện tại của SV — BE trả cờ trong `GET /advisor/at-risk-students`.
   */
  const statusBadge = student.hasOpenAppointment
    ? STATUS_STYLES.appointment
    : student.hasOpenRequest
      ? STATUS_STYLES.advising
      : null;

  // Mở Student 360 Modal — báo trạng thái đang tải ngay trên nút.
  const handleView = async () => {
    setPending(true);
    try {
      await onViewDetail(student.id);
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)] transition-shadow hover:shadow-md">
      <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', level.bar)} />

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
        >
          {initialsOf(student.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold text-slate-900">{student.fullName ?? '—'}</p>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
            {student.studentCode ?? '—'}
            {student.majorName ? ` · ${student.majorName}` : ''}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold uppercase tracking-wide ring-1 ring-inset',
            level.pill,
          )}
        >
          <span className={cn('size-1.5 rounded-full', level.bar)} aria-hidden />
          {level.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(student.reasons ?? []).map((reason) => {
          const style = REASON_STYLES[reason];
          if (!style) return null;
          return (
            <span
              key={reason}
              className={cn(
                'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
                style.chip,
              )}
            >
              {style.label}
            </span>
          );
        })}
        {student.currentGpa != null && (
          <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-bold tabular-nums text-slate-700">
            GPA {student.currentGpa.toFixed(2)}
          </span>
        )}
        {statusBadge && (
          <span
            className={cn(
              'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
              statusBadge.chip,
            )}
          >
            {statusBadge.label}
          </span>
        )}
      </div>

      {student.reasonDetails && (
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">
          {student.reasonDetails}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleView()}
        disabled={pending}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21] disabled:opacity-60"
      >
        {pending ? 'Loading...' : 'View details'}
        {!pending && <ArrowRight className="size-4" aria-hidden />}
      </button>
    </li>
  );
}

export function AtRiskStudentsWidget({ onViewDetail }: AtRiskStudentsWidgetProps) {
  const { data, isLoading, isError, refetch } = useAtRiskStudents();

  const students = data?.data ?? [];
  const total = data?.total ?? students.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span aria-hidden>⚠️</span>
          Sinh viên có nguy cơ
        </h2>
        {/* Badge chỉ hiện khi có data — không hiện khi loading/lỗi/rỗng. */}
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
            <button type="button" onClick={() => void refetch()} className="h-11 cursor-pointer font-bold underline">
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
            🎉 No students are currently flagged
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
