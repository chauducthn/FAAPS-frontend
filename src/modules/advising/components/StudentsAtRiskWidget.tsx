// src/modules/advising/components/StudentsAtRiskWidget.tsx
// Widget "Sinh viên có nguy cơ" (Flow 3 — Passive warning) cho Advisor Dashboard.
//
// Khoảnh khắc thiết kế: cảnh báo là thứ cần hành động, không phải thứ để đọc.
// Tầng đầu của widget là dải số đếm theo mức độ (High đỏ / Medium cam / Low vàng):
// con số lớn, tabular, thanh tỉ lệ để so sánh nhanh — rồi mới tới danh sách SV.
//
// Data: GET /api/advisor/at-risk-students/counts
//        -> { high: number, medium: number, low: number, total: number }

import { Link } from 'react-router';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAtRiskCounts } from '../hooks/queries/useAtRiskCounts';
import type { AtRiskCounts } from '../types/at-risk';

/**
 * Bảng màu của dải cảnh báo.
 * Mỗi mức mang 3 thứ cùng lúc: nền, số lớn, và thanh tỉ lệ — đọc được bằng mắt
 * trước khi đọc chữ.
 */
const RISK_TONES = [
  {
    key: 'high' as const,
    label: 'High',
    description: 'Needs immediate contact',
    number: 'text-red-700',
    surface: 'bg-red-50 ring-red-200',
    bar: 'bg-red-500',
    dot: 'bg-red-600',
  },
  {
    key: 'medium' as const,
    label: 'Medium',
    description: 'Schedule a meeting',
    number: 'text-orange-700',
    surface: 'bg-orange-50 ring-orange-200',
    bar: 'bg-orange-500',
    dot: 'bg-orange-600',
  },
  {
    key: 'low' as const,
    label: 'Low',
    description: 'Monitor',
    number: 'text-amber-700',
    surface: 'bg-amber-50 ring-amber-200',
    bar: 'bg-amber-500',
    dot: 'bg-amber-600',
  },
];

/** Skeleton cho dải số đếm — giữ đúng chiều cao layout thật để không nhảy. */
function CountsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" aria-hidden>
      {RISK_TONES.map((tone) => (
        <div key={tone.key} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 animate-pulse rounded-full bg-slate-200" />
            <span className="h-3 w-14 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-3 h-9 w-12 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dải số đếm theo mức độ nguy cơ.
 * Responsive: 1 cột trên màn hình hẹp, 3 cột từ breakpoint `sm` trở lên.
 * Thanh tỉ lệ dùng max của 3 mức để ba mức so sánh được với nhau.
 */
function RiskCountsStrip({ counts }: { counts: AtRiskCounts }) {
  const max = Math.max(counts.high, counts.medium, counts.low, 1);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {RISK_TONES.map((tone) => {
        const value = counts[tone.key];
        const pct = Math.round((value / max) * 100);
        return (
          <div key={tone.key} className={cn('rounded-2xl p-4 ring-1 ring-inset sm:p-5', tone.surface)}>
            <div className="flex items-center gap-2">
              <span className={cn('size-2.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
              <span className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-700">
                {tone.label}
              </span>
            </div>

            <p className={cn('mt-2 text-[34px] font-extrabold leading-none tabular-nums', tone.number)}>
              {value}
            </p>

            {/* Thanh tỉ lệ: so sánh nhanh 3 mức mà không cần đọc số. */}
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70"
              role="img"
              aria-label={`${tone.label}: ${value} students`}
            >
              <span
                className={cn('block h-full rounded-full transition-[width] duration-500 ease-out', tone.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-2.5 text-sm font-medium text-slate-600">{tone.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export function StudentsAtRiskWidget() {
  const { data: counts, isLoading, isError, refetch } = useAtRiskCounts();

  const loading = isLoading && !counts;
  const failed = isError && !counts;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <TriangleAlert className="size-5 shrink-0 text-[#F26F21]" aria-hidden />
            Sinh viên có nguy cơ
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
            Phân bố theo mức độ cảnh báo học vụ trong danh sách phụ trách.
          </p>
        </div>

        {/* Trang "My Students" đã bị gỡ khỏi menu ⇒ CTA trỏ sang hàng đợi ticket. */}
        <Link
          to="/advisor/advising-requests"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
        >
          View Requests
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <CountsSkeleton />
        ) : failed ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-red-50 px-4 py-4 ring-1 ring-inset ring-red-200">
            <p className="text-sm font-medium text-red-800">
              Không thể tải số liệu cảnh báo theo mức độ.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="h-11 cursor-pointer text-sm font-bold text-red-900 underline"
            >
              Retry
            </button>
          </div>
        ) : counts ? (
          <>
            <RiskCountsStrip counts={counts} />
            <p className="mt-3 text-sm font-medium text-slate-600">
              Tổng{' '}
              <span className="font-extrabold tabular-nums text-slate-900">{counts.total}</span> students are
              currently flagged.
              {counts.high > 0 && (
                <>
                  {' '}
                  <span className="font-bold text-red-700">{counts.high} cao</span> cần xử lý trước.
                </>
              )}
            </p>
          </>
        ) : null}
      </div>
    </section>
  );
}
