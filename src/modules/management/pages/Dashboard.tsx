import { FolderOpen, GraduationCap, UserRound } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { NewStudentsChart } from '../components/NewStudentsChart';
import { useDashboardAccounts } from '../hooks/queries/useAdminDashboard';

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardAccounts();

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#555f6f]">Admin Dashboard</h1>

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

      <NewStudentsChart />
    </div>
  );
}
