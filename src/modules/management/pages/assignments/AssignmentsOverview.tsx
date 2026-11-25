import { useMemo } from 'react';
import { Link } from 'react-router';
import { WandSparkles } from 'lucide-react';
import { AssignToAdvisorModal } from '../../components/AssignToAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortPickerModal } from '../../components/CohortPickerModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import { DataTable } from '../../../../shared/components/common/DataTable';
import { AssignmentsFilterBar, StatCard } from './AssignmentsToolbar';
import { AdvisorsTableSection, createUnassignedColumns } from './AssignmentsTables';
import { OVERVIEW_PAGE_SIZE, useAssignmentsOverviewState } from './useAssignmentsOverviewState';

const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

export default function AssignmentsOverview() {
  const s = useAssignmentsOverviewState();
  const unassignedColumns = useMemo(() => createUnassignedColumns(), []);
  const pending = s.summary.data?.pendingAdvisorRequests;

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs text-[#555f6f]">Users &amp; Advisors / Advisor Assignments</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advisor Assignments</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total students" value={s.summary.data?.total} />
        <StatCard
          label="Unassigned"
          value={s.summary.data?.unassigned}
          sub={s.waitingCohorts > 0 ? `in ${s.waitingCohorts} cohort${s.waitingCohorts === 1 ? '' : 's'}` : undefined}
          tone="warn"
          action={
            s.waitingCohorts > 0 && (
              <button type="button" className={`${btn} inline-flex shrink-0 items-center gap-1.5`} onClick={() => s.setPickerOpen(true)}>
                <WandSparkles className="size-4" aria-hidden />
                Auto assign
              </button>
            )
          }
        />
        <StatCard
          label="Waiting for an advisor"
          value={pending}
          tone="warn"
          action={
            (pending ?? 0) > 0 && (
              <button type="button" onClick={() => s.setTab('unassigned', { pending: '1' })} className="shrink-0 rounded-lg bg-[#f37021] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#d95f15]">
                Review requests
              </button>
            )
          }
        />
      </div>

      {(s.summary.data?.missingAcademicProfile ?? 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {s.summary.data?.missingAcademicProfile} student account(s) have no academic profile yet, so they do not appear in a cohort or assignment list. Complete their student details in{' '}
          <Link to="/admin/users?role=STUDENT" className="font-semibold underline">User Accounts</Link> before assigning an advisor.
        </div>
      )}

      {s.summary.isError && !s.summary.data && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load the summary.
          <button type="button" onClick={() => s.summary.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <AssignmentsFilterBar
        tab={s.tab}
        unassignedCount={s.summary.data?.unassigned}
        search={s.search}
        majorFilter={s.majorFilter}
        cohortFilter={s.cohortFilter}
        pendingOnly={s.pendingOnly}
        majors={s.majors}
        cohorts={s.cohorts}
        advisorCohortOptions={s.advisorCohortOptions}
        hasFilter={s.hasFilter}
        onTabChange={s.setTab}
        onSearchChange={(val) => { s.setSearch(val); s.setPage(0); }}
        onMajorChange={(val) => {
          s.setMajorFilter(val);
          s.setCohortFilter('');
          s.setPage(0);
        }}
        onCohortChange={(val) => { s.setCohortFilter(val); s.setPage(0); }}
        onPendingChange={(checked) => {
          s.setParams(checked ? { tab: 'unassigned', pending: '1' } : { tab: 'unassigned' }, { replace: true });
          s.setPage(0);
        }}
        onClear={() => {
          s.setSearch('');
          s.setCohortFilter('');
          s.setMajorFilter('');
          if (s.pendingOnly) s.setParams({ tab: s.tab }, { replace: true });
          s.setPage(0);
        }}
      />

      {s.tab === 'unassigned' ? (
        <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <DataTable
            manual
            columns={unassignedColumns}
            data={s.unassignedRows}
            searchKey="fullName"
            showSearch={false}
            emptyText={s.hasFilter ? 'No students match your filters.' : 'Every student has an advisor.'}
            getRowId={(row) => row.id}
            isLoading={s.unassigned.isLoading}
            totalRowCount={s.unassigned.data?.totalElements ?? 0}
            pagination={{ pageIndex: s.page, pageSize: OVERVIEW_PAGE_SIZE }}
            onPaginationChange={(next) => s.setPage(next.pageIndex)}
            bulkActions={(selectedRows) => (
              <>
                <button type="button" onClick={() => s.setBulkAssignStudents(selectedRows.map((row) => ({ id: row.id, name: row.fullName })))} className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
                  Assign to Advisor
                </button>
                <button type="button" onClick={() => s.runAutoAssign(selectedRows)} disabled={s.autoAssign.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50 disabled:opacity-50">
                  <WandSparkles className="size-4" aria-hidden />
                  {s.autoAssign.isPending ? 'Assigning...' : 'Auto Assign'}
                </button>
              </>
            )}
          />
        </section>
      ) : (
        <AdvisorsTableSection
          advisorList={s.advisorList}
          page={s.page}
          pageSize={OVERVIEW_PAGE_SIZE}
          isLoading={s.advisorRows.isLoading}
          isError={s.advisorRows.isError && !s.advisorRows.data}
          hasFilter={s.hasFilter}
          loadOf={s.loadOf}
          onRetry={() => s.advisorRows.refetch()}
          onAssignCohort={(advisorId) => s.setAssignCohortFor({ advisorId })}
          onPageChange={s.setPage}
        />
      )}

      <CohortAssignModal open={!!s.assignCohortFor} onClose={() => s.setAssignCohortFor(null)} cohorts={s.cohorts} advisors={s.advisors.data ?? []} fixedCohortId={s.assignCohortFor?.cohortId} fixedAdvisorId={s.assignCohortFor?.advisorId} />
      <CohortPickerModal open={s.pickerOpen} cohorts={s.cohorts} onClose={() => s.setPickerOpen(false)} onPick={(c) => { s.setPickerOpen(false); s.setAutoFor(c); }} />
      <AutoAssignModal open={!!s.autoFor} cohort={s.autoFor} pool={s.autoPool.data ?? []} onClose={() => s.setAutoFor(null)} onConfigurePool={() => { s.setPoolFor(s.autoFor); s.setAutoFor(null); }} />
      <CohortPoolModal open={!!s.poolFor} cohort={s.poolFor} advisors={s.advisors.data ?? []} currentIds={(s.autoPool.data ?? []).map((a) => a.advisorId)} onClose={() => s.setPoolFor(null)} />
      <AssignToAdvisorModal open={!!s.bulkAssignStudents} onClose={() => s.setBulkAssignStudents(null)} students={s.bulkAssignStudents ?? []} advisors={s.advisors.data ?? []} />
    </div>
  );
}
