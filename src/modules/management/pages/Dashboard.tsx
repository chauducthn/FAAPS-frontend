import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Download, FolderOpen, GraduationCap, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  NewStudentsChart,
  buildStudentsChartData,
  studentsRangeError,
} from '../components/NewStudentsChart';
import { useDashboardAccounts, useNewStudents } from '../hooks/queries/useAdminDashboard';
import { buildCsv, csvFilename, downloadCsv } from '../../../shared/lib/csv';
import { defaultMonthRange } from '../../../shared/lib/months';

function DashboardStatTile({
  icon,
  label,
  value,
  isLoading,
  tone,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  isLoading: boolean;
  tone: 'blue' | 'orange' | 'emerald';
  to: string;
}) {
  const iconTone = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-[#C2410C]',
    emerald: 'bg-emerald-50 text-emerald-700',
  }[tone];

  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50/40"
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-5 w-12 animate-pulse rounded bg-gray-100" />
        ) : (
          <span className="mt-0.5 block text-lg font-bold leading-none tabular-nums text-gray-900">
            {value !== undefined ? value.toLocaleString('en-US') : '—'}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardAccounts();

  const [monthRange, setMonthRange] = useState(() => defaultMonthRange(12));
  const [majorId, setMajorId] = useState('');

  const rangeError = useMemo(
    () => studentsRangeError(monthRange.start, monthRange.end),
    [monthRange],
  );

  const studentsQuery = useNewStudents(
    monthRange.start,
    monthRange.end,
    !rangeError,
    majorId,
  );

  const chartData = useMemo(
    () => buildStudentsChartData(studentsQuery.data, monthRange.start, monthRange.end),
    [studentsQuery.data, monthRange],
  );

  const handleExport = () => {
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    const csv = buildCsv([
      {
        title: 'Account totals',
        rows: [
          ['Metric', 'Value'],
          ['Student accounts', data?.students ?? 0],
          ['Advisor accounts', data?.advisors ?? 0],
          ['Cohorts', data?.cohorts ?? 0],
        ],
      },
      {
        title: 'New students by month',
        rows: [
          ['Month', 'Label', 'New students'],
          ...chartData.map((row) => [row.month, row.label, row.students]),
        ],
      },
    ]);
    downloadCsv(csv, csvFilename('admin-dashboard-report'));
    toast.success('Report exported.');
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
          <DashboardStatTile
            icon={<GraduationCap className="size-4" />}
            label="Student accounts"
            value={data?.students}
            isLoading={isLoading}
            tone="blue"
            to="/admin/users"
          />
          <DashboardStatTile
            icon={<UserRound className="size-4" />}
            label="Advisor accounts"
            value={data?.advisors}
            isLoading={isLoading}
            tone="orange"
            to="/admin/assignments"
          />
          <DashboardStatTile
            icon={<FolderOpen className="size-4" />}
            label="Cohorts"
            value={data?.cohorts}
            isLoading={isLoading}
            tone="emerald"
            to="/admin/cohorts"
          />
        </div>

        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading || studentsQuery.isLoading}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Export report
          </button>
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load account totals.
          <button type="button" onClick={() => refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      <NewStudentsChart
        startMonth={monthRange.start}
        endMonth={monthRange.end}
        majorId={majorId}
        rangeError={rangeError}
        chartData={chartData}
        isLoading={studentsQuery.isLoading}
        isError={studentsQuery.isError}
        onStartMonthChange={(month) => setMonthRange((r) => ({ ...r, start: month }))}
        onEndMonthChange={(month) => setMonthRange((r) => ({ ...r, end: month }))}
        onMajorIdChange={setMajorId}
        onRetry={() => studentsQuery.refetch()}
      />
    </div>
  );
}
