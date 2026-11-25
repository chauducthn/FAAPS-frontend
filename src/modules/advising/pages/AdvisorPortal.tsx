// Advisor Portal overview dashboard.

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/stores/useAuth';
import { useAdviseeStudents, useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { useRequiredCredits } from '../hooks/queries/useRequiredCredits';
import { RequestListTable } from '../components/RequestListTable';
import { AtRiskStudentsWidget } from '../components/AtRiskStudentsWidget';
import { StudentsAtRiskWidget } from '../components/StudentsAtRiskWidget';
import { Student360Modal } from '../components/Student360Modal';
import { advisorService, type AdvisorStudentDetail } from '../services/advisorService';
import { apiMessage } from '@/shared/lib/apiMessage';
import { AdvisorPortalHeader, AdvisorQuickLinks } from '../components/portal/AdvisorPortalHeader';
import { AssignedStudentsSection } from '../components/portal/AssignedStudentsSection';

const COUNT_SIZE = 50;

export default function AdvisorPortal() {
  const user = useAuth((s) => s.user);
  const [search, setSearch] = useState('');
  const [riskDetail, setRiskDetail] = useState<AdvisorStudentDetail | null>(null);

  const studentsQuery = useAdviseeStudents({ page: 0, size: COUNT_SIZE });
  const pendingQuery = useAdvisorAdvisingRequests({ status: 'PENDING' });
  const inProgressQuery = useAdvisorAdvisingRequests({ status: 'IN_PROGRESS' });
  const resolvedQuery = useAdvisorAdvisingRequests({ status: 'RESOLVED' });
  const { requiredCreditsFor, defaultRequiredCredits } = useRequiredCredits();

  const students = useMemo(() => studentsQuery.data?.items ?? [], [studentsQuery.data?.items]);
  const totalStudents = studentsQuery.data?.totalElements ?? students.length;

  const atRisk = useMemo(
    () => students.filter((s) => s.academicStatus === 'PROBATION' || s.academicStatus === 'SUSPENDED'),
    [students],
  );

  const topStudents = useMemo(() => students.slice(0, 5), [students]);
  const pendingCount = pendingQuery.data?.length ?? 0;

  const openRiskDetail = async (studentId: string) => {
    try {
      const result = await advisorService.getStudentDetail(studentId);
      setRiskDetail(result);
    } catch (error) {
      toast.error(apiMessage(error));
    }
  };

  return (
    <div className="w-full space-y-6 pb-4">
      <AdvisorPortalHeader
        advisorName={user?.fullName ?? 'Advisor'}
        totalStudents={totalStudents}
        atRiskCount={atRisk.length}
        pendingCount={pendingCount}
        studentsLoading={studentsQuery.isLoading}
        pendingLoading={pendingQuery.isLoading}
        inProgressLoading={inProgressQuery.isLoading}
        resolvedLoading={resolvedQuery.isLoading}
        pendingTotal={pendingQuery.data?.length}
        inProgressTotal={inProgressQuery.data?.length}
        resolvedTotal={resolvedQuery.data?.length}
      />

      <StudentsAtRiskWidget />

      <AtRiskStudentsWidget onViewDetail={openRiskDetail} />

      <AdvisorQuickLinks totalStudents={totalStudents} atRiskCount={atRisk.length} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Advising Requests</h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              One primary action per row — extras live under More.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30 sm:w-72">
              <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or title..."
                aria-label="Search requests"
                className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
              />
            </label>
            <Link
              to="/advisor/advising-requests"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-[#F26F21] transition-colors hover:bg-[#fff3ea]"
            >
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <RequestListTable search={search.trim()} />
        </div>
      </section>

      <AssignedStudentsSection
        totalStudents={totalStudents}
        atRiskCount={atRisk.length}
        topStudents={topStudents}
        isLoading={studentsQuery.isLoading}
        isError={studentsQuery.isError}
        onRetry={() => studentsQuery.refetch()}
        requiredCreditsFor={requiredCreditsFor}
        defaultRequiredCredits={defaultRequiredCredits}
      />

      <Student360Modal detail={riskDetail} onClose={() => setRiskDetail(null)} />
    </div>
  );
}
