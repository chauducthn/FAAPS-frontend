// Charts and workload summary sections for AdvisorReports.

import { apiMessage } from '@/shared/lib/apiMessage';
import GpaTrendChart from './GpaTrendChart';
import StatusPieChart from './StatusPieChart';
import { ChartEmpty, ChartError, ChartSkeleton } from './ReportStates';
import type { AdvisorReportOverview, SemesterGpaPoint, StatusSlice } from '../../types/reports';

interface AdvisorReportsChartsProps {
  semesters: SemesterGpaPoint[] | undefined;
  trendLoading: boolean;
  trendFailed: boolean;
  trendError: unknown;
  onRetryTrend: () => void;
  slices: StatusSlice[];
  distLoading: boolean;
  distFailed: boolean;
  distError: unknown;
  onRetryDist: () => void;
}

export function AdvisorReportsCharts({
  semesters,
  trendLoading,
  trendFailed,
  trendError,
  onRetryTrend,
  slices,
  distLoading,
  distFailed,
  distError,
  onRetryDist,
}: AdvisorReportsChartsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">GPA Trend</h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              Average GPA of your students per semester.
            </p>
          </div>
          {semesters && semesters.length > 0 && (
            <span className="inline-flex h-7 items-center rounded-full bg-[#fff3ea] px-3 text-xs font-extrabold tabular-nums text-[#c2410c] ring-1 ring-inset ring-orange-200">
              {semesters.length} semesters
            </span>
          )}
        </div>

        <div className="mt-6">
          {trendLoading && !semesters ? (
            <ChartSkeleton />
          ) : trendFailed ? (
            <ChartError message={apiMessage(trendError)} onRetry={onRetryTrend} />
          ) : (semesters?.length ?? 0) === 0 ? (
            <ChartEmpty message="Chưa có dữ liệu điểm học kỳ cho các sinh viên bạn phụ trách." />
          ) : (
            <GpaTrendChart semesters={semesters!} />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Status Distribution</h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              How your students are spread across academic statuses.
            </p>
          </div>
          {slices.length > 0 && (
            <span className="inline-flex h-7 items-center rounded-full bg-[#fff3ea] px-3 text-xs font-extrabold tabular-nums text-[#c2410c] ring-1 ring-inset ring-orange-200">
              {slices.length} statuses
            </span>
          )}
        </div>

        <div className="mt-6">
          {distLoading && slices.length === 0 ? (
            <ChartSkeleton />
          ) : distFailed ? (
            <ChartError message={apiMessage(distError)} onRetry={onRetryDist} />
          ) : slices.length === 0 ? (
            <ChartEmpty message="Chưa có sinh viên nào được phân công để thống kê trạng thái học vụ." />
          ) : (
            <StatusPieChart slices={slices} />
          )}
        </div>

        {slices.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4">
            {slices.map((s) => (
              <li key={s.status} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                {s.label}
                <span className="font-extrabold tabular-nums text-slate-900">{s.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function AdvisorWorkloadSection({ overview }: { overview: AdvisorReportOverview }) {
  const items = [
    { label: 'Pending requests', value: overview.pendingRequests, tone: 'text-[#F26F21]', bar: 'bg-[#F26F21]' },
    { label: 'Open appointments', value: overview.openAppointments, tone: 'text-slate-900', bar: 'bg-slate-300' },
    { label: 'Completed', value: overview.completedAppointments, tone: 'text-emerald-700', bar: 'bg-emerald-600' },
    { label: 'No-show', value: overview.noShowCount, tone: 'text-red-700', bar: 'bg-red-500' },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">Advising Workload</h2>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
        Requests and appointments in the current period.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-200">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${item.bar}`} />
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
            </div>
            <p className={`mt-2.5 text-[26px] font-extrabold leading-none tabular-nums ${item.tone}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
