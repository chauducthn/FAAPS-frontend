import { useMemo, useState } from 'react';
import { Download, FolderOpen, GraduationCap, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '../components/StatCard';
import {
  NewStudentsChart,
  buildStudentsChartData,
  studentsRangeError,
} from '../components/NewStudentsChart';
import { useDashboardAccounts, useNewStudents } from '../hooks/queries/useAdminDashboard';
import { buildCsv, csvFilename, downloadCsv } from '../../../shared/lib/csv';
import { defaultMonthRange } from '../../../shared/lib/months';

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

  // The API only returns months that have data; fill the gaps with 0.
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
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#555f6f]">Admin Dashboard</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading || studentsQuery.isLoading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-[13px] font-medium text-[#555f6f] transition-colors hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="size-3.5" />
          Export Report
        </button>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load account totals.
          <button type="button" onClick={() => refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Student Accounts" value={data?.students} isLoading={isLoading} icon={GraduationCap} iconClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Advisor Accounts" value={data?.advisors} isLoading={isLoading} icon={UserRound} iconClassName="bg-orange-100 text-orange-600" />
        <StatCard label="Cohorts" value={data?.cohorts} isLoading={isLoading} icon={FolderOpen} iconClassName="bg-emerald-100 text-emerald-600" />
      </div>

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
