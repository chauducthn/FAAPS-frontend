import { useMemo } from 'react';
import { Link } from 'react-router';
import { AlertCircle, UserPlus, WandSparkles } from 'lucide-react';
import { DataTable } from '../../../../shared/components/common/DataTable';
import { AssignmentsFilterBar, AssignmentsTabBar } from './AssignmentsToolbar';
import { AssignmentsStatStrip } from './AssignmentsStatStrip';
import { AdvisorsTableSection } from './AssignmentsTables';
import { AssignmentsModals } from './AssignmentsModals';
import { createUnassignedColumns } from './unassignedColumns';
import { OVERVIEW_PAGE_SIZE, useAssignmentsOverviewState } from './useAssignmentsOverviewState';

export default function AssignmentsOverview() {
  const s = useAssignmentsOverviewState();
  const unassignedColumns = useMemo(
    () => createUnassignedColumns((student) => s.setBulkAssignStudents([student])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="w-full min-w-0 space-y-4">
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
        onSelectUnassigned={() => s.setTab('unassigned')}
        onSelectPending={() => s.setTab('unassigned', { pending: '1' })}
        onAutoAssign={() => s.setPickerOpen(true)}
      />

      {(s.summary.data?.missingAcademicProfile ?? 0) > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <span>
            {s.summary.data?.missingAcademicProfile} student account(s) have no academic profile yet, so they do not appear in a cohort or assignment list. Complete their details in{' '}
            <Link to="/admin/users?role=STUDENT" className="font-semibold underline">User Accounts</Link>.
          </span>
        </div>
      )}

      {s.summary.isError && !s.summary.data && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          Could not load the summary.
          <button type="button" onClick={() => s.summary.refetch()} className="font-semibold underline">Retry</button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <AssignmentsTabBar tab={s.tab} unassignedCount={s.summary.data?.unassigned} onTabChange={s.setTab} />

        <AssignmentsFilterBar
          tab={s.tab}
          search={s.search}
          majorFilter={s.majorFilter}
          cohortFilter={s.cohortFilter}
          pendingOnly={s.pendingOnly}
          majors={s.majors}
          cohorts={s.cohorts}
          advisorCohortOptions={s.advisorCohortOptions}
          hasFilter={s.hasFilter}
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
          <DataTable
            className="h-[520px]"
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
                <button
                  type="button"
                  onClick={() => s.setBulkAssignStudents(selectedRows.map((row) => ({ id: row.id, name: row.fullName, cohortId: row.cohortId })))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14]"
                >
                  <UserPlus className="size-3.5" aria-hidden /> Assign to Advisor
                </button>
                <button
                  type="button"
                  onClick={() => s.runAutoAssign(selectedRows)}
                  disabled={s.autoAssign.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-800 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <WandSparkles className="size-3.5" aria-hidden />
                  {s.autoAssign.isPending ? 'Assigning...' : 'Auto Assign'}
                </button>
              </>
            )}
          />
        ) : (
          <AdvisorsTableSection
            advisorList={s.advisorList}
            page={s.page}
            pageSize={OVERVIEW_PAGE_SIZE}
            isLoading={s.advisorRows.isLoading}
            isError={s.advisorRows.isError && !s.advisorRows.data}
            hasFilter={s.hasFilter}
            loadOf={s.loadOf}
            selectedIds={s.selectedAdvisorIds}
            onToggleOne={(id) =>
              s.setSelectedAdvisorIds((cur) => {
                const next = new Set(cur);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
            onToggleAll={(ids, allSelected) =>
              s.setSelectedAdvisorIds((cur) => {
                const next = new Set(cur);
                ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
                return next;
              })
            }
            onClearSelection={() => s.setSelectedAdvisorIds(new Set())}
            onBulkAssignCohorts={(bulkAdvisors) => s.setAssignCohortFor({ bulkAdvisors })}
            onRetry={() => s.advisorRows.refetch()}
            onAssignCohort={(advisor) =>
              s.setAssignCohortFor({
                advisorId: advisor.id,
                initialCohortIds: advisor.chips.filter((c) => c.inPool).map((c) => c.key),
              })
            }
            onEditLimit={(advisor) =>
              s.setLimitTarget({ id: advisor.id, name: advisor.name, activeStudents: s.loadOf(advisor.id), limit: advisor.limit })
            }
            onOpenDetails={s.setDetailAdvisorId}
            onPageChange={s.setPage}
          />
        )}
      </section>

      <AssignmentsModals
        assignCohortFor={s.assignCohortFor}
        onCloseAssignCohort={() => s.setAssignCohortFor(null)}
        onDoneAssignCohort={() => s.setSelectedAdvisorIds(new Set())}
        pickerOpen={s.pickerOpen}
        onClosePicker={() => s.setPickerOpen(false)}
        onPickCohort={(c) => { s.setPickerOpen(false); s.setAutoFor(c); }}
        onConfigureCohortPool={(c) => { s.setPickerOpen(false); s.setPoolFor(c); }}
        autoFor={s.autoFor}
        onCloseAuto={() => s.setAutoFor(null)}
        onBackFromAuto={() => { s.setAutoFor(null); s.setPickerOpen(true); }}
        onConfigurePoolFromAuto={() => { s.setPoolFor(s.autoFor); s.setAutoFor(null); }}
        poolFor={s.poolFor}
        onClosePool={() => s.setPoolFor(null)}
        onBackFromPool={() => { s.setPoolFor(null); s.setPickerOpen(true); }}
        bulkAssignStudents={s.bulkAssignStudents}
        onCloseBulkAssign={() => s.setBulkAssignStudents(null)}
        limitTarget={s.limitTarget}
        onCloseLimit={() => s.setLimitTarget(null)}
        detailAdvisorId={s.detailAdvisorId}
        onCloseDetail={() => s.setDetailAdvisorId(null)}
        cohorts={s.cohorts}
        advisors={s.advisors.data ?? []}
        autoPool={s.autoPool.data ?? []}
        poolCountByCohort={s.poolCountByCohort}
        poolAdvisorsByCohort={s.poolAdvisorsByCohort}
      />
    </div>
  );
}
