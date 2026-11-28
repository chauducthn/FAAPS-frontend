// Advisor Reports & Analytics page with KPI overview, charts, and CSV export.

import { useMemo } from 'react';
import {
  DownloadSimple as Download,
  GraduationCap,
  Warning as TriangleAlert,
  UserCheck,
  UsersThree as UsersRound,
} from '@phosphor-icons/react';
import {
  useAdvisorGpaTrend,
  useAdvisorReportOverview,
  useAdvisorStatusDistribution,
} from '../hooks/queries/useAdvisorReports';
import { STATUS_COLORS } from '../components/reports/StatusPieChart';
import { ReportKpiCard, ReportKpiSkeleton, type ReportKpi } from '../components/reports/ReportKpiCard';
import { AdvisorReportsCharts, AdvisorWorkloadSection } from '../components/reports/AdvisorReportsCharts';
import { exportAdvisorReportsCsv } from '../components/reports/exportAdvisorReportsCsv';
import type { StatusSlice } from '../types/reports';

const STATUS_ORDER = [
  'ACTIVE',
  'PROBATION',
  'SUSPENDED',
  'GRADUATED',
  'WITHDRAWN',
  'LEAVE_OF_ABSENCE',
] as const;

export default function AdvisorReports() {
  const overviewQuery = useAdvisorReportOverview();
  const trendQuery = useAdvisorGpaTrend();
  const distributionQuery = useAdvisorStatusDistribution();

  const overview = overviewQuery.data;

  const kpis: ReportKpi[] = useMemo(
    () => [
      {
        label: 'Assigned Students',
        value: String(overview?.totalStudents ?? 0),
        sub: 'total students',
        icon: UsersRound,
        iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]',
        topBar: 'bg-slate-900',
      },
      {
        label: 'Active',
        value: String(overview?.activeStudents ?? 0),
        sub: 'studying normally',
        icon: UserCheck,
        iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]',
        topBar: 'bg-emerald-600',
      },
      {
        label: 'At Risk',
        value: String(overview?.atRiskStudents ?? 0),
        sub: 'probation / suspended',
        icon: TriangleAlert,
        iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]',
        topBar: 'bg-[#F26F21]',
      },
      {
        label: 'Avg GPA',
        value: overview ? overview.avgGpa.toFixed(2) : '0.00',
        sub: 'cohort average',
        icon: GraduationCap,
        iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
        topBar: 'bg-slate-300',
      },
    ],
    [overview],
  );

  const slices: StatusSlice[] = useMemo(() => {
    const dist = distributionQuery.data;
    if (!dist) return [];
    const total = Object.values(dist).reduce<number>((sum, n) => sum + (n ?? 0), 0);
    if (total === 0) return [];

    const keys = [
      ...STATUS_ORDER.filter((s) => s in dist),
      ...Object.keys(dist).filter((k) => !STATUS_ORDER.includes(k as (typeof STATUS_ORDER)[number])),
    ];

    return keys
      .map((status) => {
        const count = dist[status] ?? 0;
        const meta = STATUS_COLORS[status] ?? { color: '#94a3b8', label: status };
        return {
          status,
          label: meta.label,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0,
          color: meta.color,
        };
      })
      .filter((s) => s.count > 0);
  }, [distributionQuery.data]);

  const overviewFailed = overviewQuery.isError && !overview;
  const trendFailed = trendQuery.isError && !trendQuery.data;
  const distributionFailed = distributionQuery.isError && !distributionQuery.data;

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--brand)] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              Reports &amp; Analytics
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {overview
                ? `${overview.totalStudents} assigned students · avg GPA ${overview.avgGpa.toFixed(2)} · ${overview.atRiskStudents} at risk`
                : 'Academic standing across the students you advise.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => exportAdvisorReportsCsv(overview, slices, trendQuery.data?.semesters)}
              disabled={!overview}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4" aria-hidden />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {overviewQuery.isLoading && !overview ? (
        <ReportKpiSkeleton />
      ) : overviewFailed ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">
          Could not load the overview figures.{' '}
          <button type="button" onClick={() => void overviewQuery.refetch()} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {kpis.map((k) => (
            <ReportKpiCard key={k.label} kpi={k} />
          ))}
        </div>
      )}

      <AdvisorReportsCharts
        semesters={trendQuery.data?.semesters}
        trendLoading={trendQuery.isLoading}
        trendFailed={trendFailed}
        trendError={trendQuery.error}
        onRetryTrend={() => void trendQuery.refetch()}
        slices={slices}
        distLoading={distributionQuery.isLoading}
        distFailed={distributionFailed}
        distError={distributionQuery.error}
        onRetryDist={() => void distributionQuery.refetch()}
      />

      {overview && <AdvisorWorkloadSection overview={overview} />}
    </div>
  );
}
