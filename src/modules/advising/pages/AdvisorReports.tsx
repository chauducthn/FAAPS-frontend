// src/pages/advising/AdvisorReports.tsx
// "Reports & Analytics" — trang tong quan hoc vu cua advisor (Flow 5).
//
// Bo cuc: mot hang KPI (Overview) o tren, duoi la hai bieu do song song — LineChart
// GPA theo hoc ky va PieChart phan bo trang thai hoc vu. Cung he cam FPT voi cac
// trang advisor khac: hero gradient cam, card trang vien slate.
//
// Ba API (BE: AdvisorReportController):
//   GET /advisor/reports/overview          -> KPI tong quan
//   GET /advisor/reports/gpa-trend         -> { semesters: [...] }
//   GET /advisor/reports/status-distribution -> { ACTIVE: 10, PROBATION: 2, ... }

import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  CalendarCheck,
  CircleCheckBig,
  Download,
  GraduationCap,
  Inbox,
  TriangleAlert,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { buildCsv, csvFilename, downloadCsv } from '@/shared/lib/csv';
import {
  useAdvisorGpaTrend,
  useAdvisorReportOverview,
  useAdvisorStatusDistribution,
} from '../hooks/queries/useAdvisorReports';
import GpaTrendChart from '../components/reports/GpaTrendChart';
import StatusPieChart, { STATUS_COLORS } from '../components/reports/StatusPieChart';
import { ChartEmpty, ChartError, ChartSkeleton } from '../components/reports/ReportStates';
import { ReportKpiCard, ReportKpiSkeleton, type ReportKpi } from '../components/reports/ReportKpiCard';
import type { StatusSlice } from '../types/reports';

/** Thu tu cac trang thai — giong thu tu BE khoi tao ban do. */
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

  /** 4 KPI chinh theo brief: tong SV, active, at-risk, GPA trung binh. */
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

  /** Chuyen map cua BE thanh mang de ve PieChart. */
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

  const handleExport = () => {
    if (!overview) {
      toast.error('There is no overview data to export yet.');
      return;
    }
    const csv = buildCsv([
      {
        title: 'Overview',
        rows: [
          ['Metric', 'Value'],
          ['Assigned students', overview.totalStudents],
          ['Active students', overview.activeStudents],
          ['At-risk students', overview.atRiskStudents],
          ['Probation', overview.probationCount],
          ['Suspended', overview.suspendedCount],
          ['Average GPA', overview.avgGpa.toFixed(2)],
          ['Pending requests', overview.pendingRequests],
          ['Open appointments', overview.openAppointments],
          ['Completed appointments', overview.completedAppointments],
          ['No-show appointments', overview.noShowCount],
        ],
      },
      // Chỉ xuất section khi có dữ liệu — không để lại section chỉ có dòng header.
      ...(slices.length > 0
        ? [
            {
              title: 'Status distribution',
              rows: [
                ['Status', 'Students', 'Percent'],
                ...slices.map((s) => [s.label, s.count, `${s.percent}%`]),
              ],
            },
          ]
        : []),
      ...((trendQuery.data?.semesters.length ?? 0) > 0
        ? [
            {
              title: 'GPA trend',
              rows: [
                ['Semester', 'Code', 'Avg GPA', 'Min GPA', 'Max GPA', 'Students'],
                ...(trendQuery.data?.semesters ?? []).map((s) => [
                  s.name,
                  s.code,
                  s.avgGpa.toFixed(2),
                  s.minGpa.toFixed(2),
                  s.maxGpa.toFixed(2),
                  s.studentCount,
                ]),
              ],
            },
          ]
        : []),
    ]);
    downloadCsv(csv, csvFilename('advisor-reports'));
    toast.success('CSV report exported.');
  };

  const overviewFailed = overviewQuery.isError && !overview;
  const trendFailed = trendQuery.isError && !trendQuery.data;
  const distributionFailed = distributionQuery.isError && !distributionQuery.data;

  return (
    <div className="w-full space-y-6 pb-4">
      {/* ── Hero: cùng hệ cam FPT, nút trắng nổi rõ là clickable ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
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
              onClick={handleExport}
              disabled={!overview}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4" aria-hidden />
              Export CSV
            </button>
            <Link
              to="/advisor/students"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] active:scale-[0.98]"
            >
              View students <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI: dong bo 4 the Overview ── */}
      {overviewQuery.isLoading && !overview ? (
        <ReportKpiSkeleton />
      ) : overviewFailed ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">
          Không thể tải số liệu tổng quan.{' '}
          <button
            type="button"
            onClick={() => void overviewQuery.refetch()}
            className="cursor-pointer font-bold underline"
          >
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

      {/* ── Bieu do: LineChart + PieChart ── */}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">GPA Trend</h2>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
                Average GPA of your students per semester.
              </p>
            </div>
            {trendQuery.data && trendQuery.data.semesters.length > 0 && (
              <span className="inline-flex h-7 items-center rounded-full bg-[#fff3ea] px-3 text-xs font-extrabold tabular-nums text-[#c2410c] ring-1 ring-inset ring-orange-200">
                {trendQuery.data.semesters.length} semesters
              </span>
            )}
          </div>

          <div className="mt-6">
            {trendQuery.isLoading && !trendQuery.data ? (
              <ChartSkeleton />
            ) : trendFailed ? (
              <ChartError
                message={apiMessage(trendQuery.error)}
                onRetry={() => void trendQuery.refetch()}
              />
            ) : (trendQuery.data?.semesters.length ?? 0) === 0 ? (
              <ChartEmpty message="There is no GPA data for your assigned students yet." />
            ) : (
              <GpaTrendChart semesters={trendQuery.data!.semesters} />
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
            {distributionQuery.isLoading && !distributionQuery.data ? (
              <ChartSkeleton />
            ) : distributionFailed ? (
              <ChartError
                message={apiMessage(distributionQuery.error)}
                onRetry={() => void distributionQuery.refetch()}
              />
            ) : slices.length === 0 ? (
              <ChartEmpty message="No student has been assigned yet, so there is no academic status data to summarise." />
            ) : (
              <StatusPieChart slices={slices} />
            )}
          </div>

          {/* Chu giai: doc lai mau o chinh be, khong phai hover tooltip. */}
          {slices.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4">
              {slices.map((s) => (
                <li key={s.status} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                  <span className="font-extrabold tabular-nums text-slate-900">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Hang chi so phu: ho so cac buoc lam viec ── */}
      {overview && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Advising Workload</h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
            Requests and appointments in the current period.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: 'Pending requests',
                value: overview.pendingRequests,
                icon: Inbox,
                tone: 'text-[#F26F21]',
                bar: 'bg-[#F26F21]',
              },
              {
                label: 'Open appointments',
                value: overview.openAppointments,
                icon: CalendarCheck,
                tone: 'text-slate-900',
                bar: 'bg-slate-300',
              },
              {
                label: 'Completed',
                value: overview.completedAppointments,
                icon: CircleCheckBig,
                tone: 'text-emerald-700',
                bar: 'bg-emerald-600',
              },
              {
                label: 'No-show',
                value: overview.noShowCount,
                icon: TriangleAlert,
                tone: 'text-red-700',
                bar: 'bg-red-500',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-200">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${item.bar}`} />
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    {item.label}
                  </p>
                </div>
                <p
                  className={`mt-2.5 text-[26px] font-extrabold leading-none tabular-nums ${item.tone}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
