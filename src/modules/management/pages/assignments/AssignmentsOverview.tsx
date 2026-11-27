import { useMemo } from 'react';
import { Link } from 'react-router';
import { WarningCircle as AlertCircle } from '@phosphor-icons/react';
import { AssignmentsFilterBar, AssignmentsTabBar } from './AssignmentsToolbar';
import { AssignmentsStatStrip } from './AssignmentsStatStrip';
import { AssignmentsModals } from './AssignmentsModals';
import { AssignmentsTabTables } from './AssignmentsTabTables';
import { createAssignedColumns } from './assignedColumns';
import { createUnassignedColumns } from './unassignedColumns';
import { useAssignmentsOverviewState } from './useAssignmentsOverviewState';

export default function AssignmentsOverview() {
  const s = useAssignmentsOverviewState();
  const unassignedColumns = useMemo(
    () => createUnassignedColumns((student) => s.setBulkAssignStudents([student])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const assignedColumns = useMemo(
    () =>
      createAssignedColumns({
        onFilterAdvisor: (advisorId) => s.setAdvisorFilter(advisorId),
        onHistory: (student) => s.setHistoryStudent(student),
        onReassign: (student) => s.setReassignStudents([student]),
        onUnassign: (student) => s.setUnassignStudents([student]),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="w-full min-w-0 space-y-4">
      <AssignmentsTabBar
        tab={s.tab}
        assignedCount={s.summary.data?.assigned}
        unassignedCount={s.summary.data?.unassigned}
        canAutoAssign={s.waitingCohorts > 0}
        onTabChange={s.setTab}
        onAutoAssign={() => s.setPickerOpen(true)}
      />

      <AssignmentsStatStrip
        total={s.summary.data?.total}
        assigned={s.summary.data?.assigned}
        unassigned={s.summary.data?.unassigned}
        pending={s.summary.data?.pendingAdvisorRequests}
        waitingCohorts={s.waitingCohorts}
        advisorCount={s.advisors.data?.length ?? 0}
        activeTab={s.tab}
        pendingOnly={s.pendingOnly}
        onSelectAdvisors={() => s.setTab('advisors')}
        onSelectAssigned={() => s.setTab('assigned')}
        onSelectUnassigned={() => s.setTab('unassigned')}
        onSelectPending={() => s.setTab('unassigned', { pending: '1' })}
      />

      {(s.summary.data?.missingAcademicProfile ?? 0) > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <span>
            {s.summary.data?.missingAcademicProfile} student account(s) have no academic profile yet, so they do not appear in a cohort or assignment list. Complete their details in{' '}
            <Link to="/admin/users?role=STUDENT" className="font-semibold underline">User Accounts</Link>.
          </span>
        </div>
      )}

      {s.summary.isError && !s.summary.data && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          Could not load the summary.
          <button type="button" onClick={() => s.summary.refetch()} className="font-semibold underline">Retry</button>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
        <AssignmentsFilterBar
          tab={s.tab} search={s.search} advisorFilter={s.advisorFilter} majorFilter={s.majorFilter}
          cohortFilter={s.cohortFilter} pendingOnly={s.pendingOnly} advisors={s.advisors.data ?? []}
          majors={s.majors} cohorts={s.cohorts} advisorCohortOptions={s.advisorCohortOptions} hasFilter={s.hasFilter}
          onSearchChange={(val) => { s.setSearch(val); s.setPage(0); }}
          onAdvisorChange={(val) => s.setAdvisorFilter(val)}
          onMajorChange={(val) => {
            s.setMajorFilter(val); s.setCohortFilter('');
            s.setPage(0);
          }}
          onCohortChange={(val) => { s.setCohortFilter(val); s.setPage(0); }}
          onPendingChange={(checked) => {
            s.setParams(checked ? { tab: 'unassigned', pending: '1' } : { tab: 'unassigned' }, { replace: true });
            s.setPage(0);
          }}
          onClear={() => {
            s.setSearch(''); s.setCohortFilter('');
            s.setMajorFilter('');
            if (s.pendingOnly || s.advisorFilter) s.setParams({ tab: s.tab }, { replace: true });
            s.setPage(0);
          }}
        />
        <AssignmentsTabTables s={s} assignedColumns={assignedColumns} unassignedColumns={unassignedColumns} />
      </section>

      <AssignmentsModals
        assignCohortFor={s.assignCohortFor} onCloseAssignCohort={() => s.setAssignCohortFor(null)}
        onDoneAssignCohort={() => s.setSelectedAdvisorIds(new Set())} pickerOpen={s.pickerOpen}
        onClosePicker={() => s.setPickerOpen(false)}
        onPickCohort={(c) => { s.setPickerOpen(false); s.setAutoFor(c); }}
        onConfigureCohortPool={(c) => { s.setPickerOpen(false); s.setPoolFor(c); }}
        autoFor={s.autoFor} onCloseAuto={() => s.setAutoFor(null)}
        onBackFromAuto={() => { s.setAutoFor(null); s.setPickerOpen(true); }}
        onConfigurePoolFromAuto={() => { s.setPoolFor(s.autoFor); s.setAutoFor(null); }}
        poolFor={s.poolFor} onClosePool={() => s.setPoolFor(null)}
        onBackFromPool={() => { s.setPoolFor(null); s.setPickerOpen(true); }}
        bulkAssignStudents={s.bulkAssignStudents} onCloseBulkAssign={() => s.setBulkAssignStudents(null)}
        reassignStudents={s.reassignStudents} onCloseReassign={() => s.setReassignStudents(null)}
        excludeAdvisorId={s.advisorFilter || undefined} unassignStudents={s.unassignStudents}
        onCloseUnassignStudents={() => s.setUnassignStudents(null)} historyStudent={s.historyStudent}
        onCloseHistory={() => s.setHistoryStudent(null)} limitTarget={s.limitTarget}
        onCloseLimit={() => s.setLimitTarget(null)} unassignAllTarget={s.unassignAllTarget}
        onCloseUnassignAll={() => s.setUnassignAllTarget(null)}
        onDoneUnassignAll={() => s.setSelectedAdvisorIds(new Set())}
        cohorts={s.cohorts} advisors={s.advisors.data ?? []} autoPool={s.autoPool.data ?? []}
        poolCountByCohort={s.poolCountByCohort} poolAdvisorsByCohort={s.poolAdvisorsByCohort}
      />
    </div>
  );
}
