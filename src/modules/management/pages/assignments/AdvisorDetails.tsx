import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { AssignAdvisorModal } from '../../components/AssignAdvisorModal';
import { UnassignAdvisorModal } from '../../components/UnassignAdvisorModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { useBackTarget } from '../../../../shared/lib/backLink';
import type { AdminUserStatus } from '../../types/admin';
import { AdvisorCohortsCard, AdvisorProfileCard } from './AdvisorProfileCard';
import { AdvisorStudentsSection } from './AdvisorStudentsSection';
import { ADVISOR_PAGE_SIZE, useAdvisorDetailsState } from './useAdvisorDetailsState';

export default function AdvisorDetails() {
  const { advisorId } = useParams();
  const backTarget = useBackTarget('/admin/assignments?tab=advisors', 'Advisor Assignments · Advisors tab');
  const s = useAdvisorDetailsState(advisorId);
  const { data, isLoading, isError, refetch } = s.assignmentQuery;

  const back = (
    <Link to={backTarget.to} className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
      <ChevronLeft className="size-4" />
      Back to {backTarget.label}
    </Link>
  );

  if (isLoading) {
    return (
      <div className="w-full">
        {back}
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full">
        {back}
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">
          Could not load this advisor. They may be inactive or no longer exist.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { advisor } = data;
  const overBy = advisor.maxAdvisees !== null ? Math.max(0, advisor.activeStudents - advisor.maxAdvisees) : 0;
  const selectedList = () =>
    s.students.filter((st) => s.selected.has(st.id)).map((st) => ({ id: st.id, name: st.fullName }));

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        {back}
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Advisor Assignment Details</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Current student assignments for {advisor.fullName} · {advisor.email}
        </p>
      </div>

      <AdvisorProfileCard
        advisor={advisor}
        email={data.email}
        status={data.status as AdminUserStatus}
        overBy={overBy}
        assignmentStartDate={s.assignmentStartDate}
        scheduleError={s.scheduleError}
        editingLimit={s.editingLimit}
        limitValue={s.limitValue}
        limitError={s.limitError}
        isSavingLimit={s.updateLimit.isPending}
        onStartDateChange={s.setAssignmentStartDate}
        onSaveDate={s.saveDate}
        onLimitValueChange={s.setLimitValue}
        onStartEditLimit={() => {
          s.setLimitValue(String(advisor.maxAdvisees ?? ''));
          s.setLimitError(null);
          s.setEditingLimit(true);
        }}
        onCancelEditLimit={() => s.setEditingLimit(false)}
        onSaveLimit={s.saveLimit}
      />

      <AdvisorCohortsCard cohorts={s.myCohorts} onAssignCohort={() => s.setAssignCohortOpen(true)} />

      <AdvisorStudentsSection
        advisorId={advisorId}
        advisorName={advisor.fullName}
        search={s.search}
        page={s.page}
        pageSize={ADVISOR_PAGE_SIZE}
        totalFiltered={s.filtered.length}
        pageRows={s.pageRows}
        selected={s.selected}
        allPageSelected={s.allPageSelected}
        onSearchChange={(val) => {
          s.setSearch(val);
          s.setPage(0);
        }}
        onClearSearch={() => s.setSearch('')}
        onToggleAll={s.toggleAll}
        onToggleOne={s.toggleOne}
        onClearSelection={() => s.setSelected(new Set())}
        onReassignSelected={() => s.setReassign(selectedList())}
        onUnassignSelected={() => s.setUnassign(selectedList())}
        onReassignOne={(student) => s.setReassign([student])}
        onUnassignOne={(student) => s.setUnassign([student])}
        onPageChange={s.setPage}
      />

      <AssignAdvisorModal open={!!s.reassign} onClose={() => s.setReassign(null)} students={s.reassign ?? []} advisors={s.advisors.data ?? []} excludeAdvisorId={advisor.id} onDone={() => s.setSelected(new Set())} />
      <UnassignAdvisorModal students={s.unassign} onClose={() => s.setUnassign(null)} onDone={() => s.setSelected(new Set())} />
      <CohortAssignModal open={s.assignCohortOpen} onClose={() => s.setAssignCohortOpen(false)} cohorts={s.summary.data?.cohorts ?? []} advisors={s.advisors.data ?? []} fixedAdvisorId={advisor.id} />
    </div>
  );
}
