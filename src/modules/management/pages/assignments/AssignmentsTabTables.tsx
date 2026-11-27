import { ArrowsLeftRight, UserMinus, UserPlus } from '@phosphor-icons/react';
import { DataTable } from '../../../../shared/components/common/DataTable';
import { fetchAllPages } from '../../../../shared/lib/fetchAllPages';
import { assignmentService } from '../../../advising/services/assignmentService';
import { AdvisorsTableSection } from './AssignmentsTables';
import type { createAssignedColumns } from './assignedColumns';
import type { createUnassignedColumns } from './unassignedColumns';
import { OVERVIEW_PAGE_SIZE, type useAssignmentsOverviewState } from './useAssignmentsOverviewState';

type State = ReturnType<typeof useAssignmentsOverviewState>;

export function AssignmentsTabTables({
  s,
  assignedColumns,
  unassignedColumns,
}: {
  s: State;
  assignedColumns: ReturnType<typeof createAssignedColumns>;
  unassignedColumns: ReturnType<typeof createUnassignedColumns>;
}) {
  if (s.tab === 'assigned') {
    return (
      <DataTable
        className="admin-fill"
        manual
        columns={assignedColumns}
        data={s.assignedRows}
        searchKey="fullName"
        showSearch={false}
        emptyText={s.hasFilter ? 'No assigned students match your filters.' : 'No students have been assigned yet.'}
        getRowId={(row) => row.id}
        isLoading={s.assigned.isLoading}
        totalRowCount={s.assigned.data?.totalElements ?? 0}
        onFetchAllRows={() =>
          fetchAllPages((page, size) =>
            assignmentService.getAssigned({
              advisorId: s.advisorFilter || undefined,
              cohort: s.cohortFilter && s.cohortFilter !== '__NONE__' ? s.cohortFilter : undefined,
              majorCode: s.majorFilter && s.majorFilter !== '__NONE__' ? s.majorFilter : undefined,
              search: s.search.trim() || undefined,
              page,
              size,
            }),
          )
        }
        pagination={{ pageIndex: s.page, pageSize: OVERVIEW_PAGE_SIZE }}
        onPaginationChange={(next) => s.setPage(next.pageIndex)}
        showPageSizeSelect={false}
        showPageJump
        bulkActions={(selectedRows) => (
          <>
            <button
              type="button"
              onClick={() =>
                s.setReassignStudents(
                  selectedRows.map((row) => ({
                    id: row.id, name: row.fullName, cohortId: row.cohortId, advisorId: row.advisorId,
                  })),
                )
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white px-3 text-[13px] font-medium text-ink-primary ring-1 ring-line transition-colors hover:bg-surface-hover"
            >
              <ArrowsLeftRight className="size-3.5" aria-hidden /> Reassign
            </button>
            <button
              type="button"
              onClick={() => s.setUnassignStudents(selectedRows.map((row) => ({ id: row.id, name: row.fullName })))}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-50 px-3 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <UserMinus className="size-3.5" aria-hidden /> Unassign
            </button>
          </>
        )}
      />
    );
  }

  if (s.tab === 'unassigned') {
    return (
      <DataTable
        className="admin-fill"
        manual
        columns={unassignedColumns}
        data={s.unassignedRows}
        searchKey="fullName"
        showSearch={false}
        emptyText={s.hasFilter ? 'No students match your filters.' : 'Every student has an advisor.'}
        getRowId={(row) => row.id}
        isLoading={s.unassigned.isLoading}
        totalRowCount={s.unassigned.data?.totalElements ?? 0}
        onFetchAllRows={async () => {
          const items = await fetchAllPages((page, size) =>
            assignmentService.getUnassigned({
              search: s.search.trim() || undefined,
              cohort: s.cohortFilter && s.cohortFilter !== '__NONE__' ? s.cohortFilter : undefined,
              hasPendingRequest: s.pendingOnly ? true : undefined,
              page,
              size,
            }),
          );
          return s.majorFilter && !s.cohortFilter ? items.filter((x) => x.majorCode === s.majorFilter) : items;
        }}
        pagination={{ pageIndex: s.page, pageSize: OVERVIEW_PAGE_SIZE }}
        onPaginationChange={(next) => s.setPage(next.pageIndex)}
        showPageSizeSelect={false}
        showPageJump
        bulkActions={(selectedRows) => (
          <button
            type="button"
            onClick={() => s.setBulkAssignStudents(selectedRows.map((row) => ({ id: row.id, name: row.fullName, cohortId: row.cohortId })))}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white px-3 text-[13px] font-medium text-ink-primary ring-1 ring-line transition-colors hover:bg-surface-hover"
          >
            <UserPlus className="size-3.5" aria-hidden /> Assign to Advisor
          </button>
        )}
      />
    );
  }

  return (
    <AdvisorsTableSection
      advisorList={s.advisorList} page={s.page} pageSize={OVERVIEW_PAGE_SIZE}
      isLoading={s.advisorRows.isLoading} isError={s.advisorRows.isError && !s.advisorRows.data}
      hasFilter={s.hasFilter} loadOf={s.loadOf} selectedIds={s.selectedAdvisorIds}
      onToggleOne={(id) => s.setSelectedAdvisorIds((cur) => (cur.has(id) ? new Set([...cur].filter((x) => x !== id)) : new Set([...cur, id])))}
      onToggleAll={(ids, allSelected) => s.setSelectedAdvisorIds((cur) => (allSelected ? new Set([...cur].filter((x) => !ids.includes(x))) : new Set([...cur, ...ids])))}
      onSelectAllAdvisors={(ids) => s.setSelectedAdvisorIds(new Set(ids))}
      onClearSelection={() => s.setSelectedAdvisorIds(new Set())}
      onBulkAssignCohorts={(bulkAdvisors) => s.setAssignCohortFor({ bulkAdvisors })}
      onBulkUnassignAdvisors={(selected) =>
        s.setUnassignAllTarget({
          advisorIds: selected.map((a) => a.id),
          label: `${selected.length} selected advisor${selected.length === 1 ? '' : 's'}`,
        })
      }
      onRetry={() => s.advisorRows.refetch()}
      onAssignCohort={(advisor) =>
        s.setAssignCohortFor({ advisorId: advisor.id, initialCohortIds: advisor.chips.filter((c) => c.inPool).map((c) => c.key) })
      }
      onEditLimit={(advisor) =>
        s.setLimitTarget({ id: advisor.id, name: advisor.name, activeStudents: s.loadOf(advisor.id), limit: advisor.limit })
      }
      onOpenDetails={s.openAdvisorStudents} onPageChange={s.setPage}
    />
  );
}
