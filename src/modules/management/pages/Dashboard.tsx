import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NewStudentsChart, buildStudentsChartData, studentsRangeError } from '../components/NewStudentsChart';
import { AdvisorCapacityCard, DashboardNeedsAttention, MajorCoverageCard } from '../components/DashboardInsights';
import { DashboardKpiStrip } from '../components/DashboardKpiStrip';
import { useAiReports, useDashboardAccounts, useNewStudents } from '../hooks/queries/useAdminDashboard';
import { useAssignmentAdvisors, useAssignmentSummary } from '../hooks/queries/useAdminAssignments';
import { useAppointmentSummary } from '../hooks/queries/useAdminAppointments';
import { ACADEMIC_RULE_QUERY_KEYS } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { academicRuleService } from '../services/academic-rule.service';
import { databaseService } from '../services/database.service';
import { buildCsv, csvFilename, downloadCsv } from '../../../shared/lib/csv';
import { defaultMonthRange } from '../../../shared/lib/months';

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardAccounts();
  const assignmentQuery = useAssignmentSummary();
  const advisorsQuery = useAssignmentAdvisors();
  const appointmentQuery = useAppointmentSummary();
  const aiReportsQuery = useAiReports({ status: 'PENDING', page: 0, size: 1 });
  const rulesSummaryQuery = useQuery({
    queryKey: [...ACADEMIC_RULE_QUERY_KEYS.all, 'summary'],
    queryFn: academicRuleService.summary,
  });
  const dbOverviewQuery = useQuery({
    queryKey: ['admin', 'database', 'overview'],
    queryFn: databaseService.getOverview,
  });

  const [monthRange, setMonthRange] = useState(() => defaultMonthRange(12));
  const [majorId, setMajorId] = useState('');

  const rangeError = useMemo(() => studentsRangeError(monthRange.start, monthRange.end), [monthRange]);
  const studentsQuery = useNewStudents(monthRange.start, monthRange.end, !rangeError, majorId);
  const chartData = useMemo(
    () => buildStudentsChartData(studentsQuery.data, monthRange.start, monthRange.end),
    [studentsQuery.data, monthRange],
  );

  const assignment = assignmentQuery.data;
  const advisors = advisorsQuery.data ?? [];
  const appointments = appointmentQuery.data;
  const pendingReports = aiReportsQuery.data?.totalElements ?? 0;
  const rulesSummary = rulesSummaryQuery.data;
  const dbOverview = dbOverviewQuery.data;

  const coveragePct = assignment && assignment.total > 0 ? Math.round((assignment.assigned / assignment.total) * 100) : 0;
  const idleAdvisors = advisors.filter((a) => a.activeStudents === 0).length;

  const handleExport = () => {
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    const csv = buildCsv([
      {
        title: 'System totals',
        rows: [
          ['Metric', 'Value'],
          ['Student accounts', data?.students ?? 0],
          ['Advisor accounts', data?.advisors ?? 0],
          ['Assigned students', assignment?.assigned ?? 0],
          ['Unassigned students', assignment?.unassigned ?? 0],
          ['Coverage (%)', coveragePct],
          ['Cohorts', data?.cohorts ?? 0],
          ['Majors', dbOverview?.majors ?? 0],
          ['Courses', dbOverview?.courses ?? 0],
          ['Appointments (total)', appointments?.total ?? 0],
          ['Appointments (scheduled)', appointments?.scheduled ?? 0],
          ['Pending AI reports', pendingReports],
          ['Active academic rules', rulesSummary?.active ?? 0],
        ],
      },
      {
        title: 'New students by month',
        rows: [['Month', 'Label', 'New students'], ...chartData.map((r) => [r.month, r.label, r.students])],
      },
    ]);
    downloadCsv(csv, csvFilename('admin-dashboard-report'));
    toast.success('Report exported.');
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <DashboardKpiStrip
        students={data?.students} advisors={data?.advisors} cohorts={data?.cohorts}
        unassigned={assignment?.unassigned} pendingRequests={assignment?.pendingAdvisorRequests}
        appointmentsTotal={appointments?.total} appointmentsScheduled={appointments?.scheduled}
        pendingReports={pendingReports} activeRules={rulesSummary?.active}
        majorsCount={dbOverview?.majors} coursesCount={dbOverview?.courses}
        coveragePct={coveragePct} idleAdvisors={idleAdvisors}
        hasAssignment={!!assignment} hasAdvisors={advisors.length > 0}
        isLoading={isLoading} assignmentLoading={assignmentQuery.isLoading}
        appointmentLoading={appointmentQuery.isLoading} aiReportsLoading={aiReportsQuery.isLoading}
        exportDisabled={isLoading || studentsQuery.isLoading} onExport={handleExport}
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load account totals.
          <button type="button" onClick={() => refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <NewStudentsChart
            startMonth={monthRange.start} endMonth={monthRange.end} majorId={majorId}
            rangeError={rangeError} chartData={chartData} isLoading={studentsQuery.isLoading}
            isError={studentsQuery.isError}
            onStartMonthChange={(month) => setMonthRange((r) => ({ ...r, start: month }))}
            onEndMonthChange={(month) => setMonthRange((r) => ({ ...r, end: month }))}
            onMajorIdChange={setMajorId} onRetry={() => studentsQuery.refetch()}
          />
        </div>
        <DashboardNeedsAttention
          assignment={assignment} advisors={advisors} pendingReports={pendingReports}
          draftRules={rulesSummary?.draft ?? 0} appointments={appointments}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MajorCoverageCard assignment={assignment} />
        <AdvisorCapacityCard assignment={assignment} advisors={advisors} />
      </div>
    </div>
  );
}
