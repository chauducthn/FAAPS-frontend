// src/modules/advising/components/reports/ReportKpiCard.tsx
// The KPI read-only cua trang Reports — dong bo voi KPI card o AdvisorPortal/AdvisorStudents
// (card trang, top-bar mau theo nghia, so lon tabular).
//
// Read-only: khong hover, khong click. Chi la so lieu de doc.

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface ReportKpi {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  /** Mau cua thanh tren + icon box. */
  topBar: string;
  iconBox: string;
}

interface Props {
  kpi: ReportKpi;
  /** Dang tai — so hien la dau gach ngang thay vi so that. */
  loading?: boolean;
}

export function ReportKpiCard({ kpi, loading }: Props) {
  return (
    <div
      aria-readonly="true"
      className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]"
    >
      <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', kpi.topBar)} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{kpi.label}</p>
          {loading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-slate-100" aria-hidden />
          ) : (
            <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">
              {kpi.value}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-slate-600">{kpi.sub}</p>
        </div>
        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', kpi.iconBox)}>
          <kpi.icon className="size-5" aria-hidden strokeWidth={2.25} />
        </span>
      </div>
    </div>
  );
}

/** Skeleton cua hang KPI — giu dung bo khong de layout khong nhay. */
export function ReportKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
        >
          <span className="absolute inset-x-0 top-0 h-1 animate-pulse bg-slate-100" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <span className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
