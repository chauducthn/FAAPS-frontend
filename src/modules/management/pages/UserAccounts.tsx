import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { NO_PASSWORD_REASON } from '../components/UserRowMenu';
import { canResetPassword } from '../utils/passwordReset';
import { DataTable } from '../../../shared/components/common/DataTable';
import { adminService } from '../services/adminService';
import { createUserAccountColumns } from './users/userAccountColumns';
import { UserAccountsHeader } from './users/UserAccountsHeader';
import { UserAccountsErrorState, UserAccountsFilterBar } from './users/UserAccountsFilterBar';
import { UserAccountsModals } from './users/UserAccountsModals';
import { UserBulkActions } from './users/UserBulkActions';
import { useUserAccountsState } from './users/useUserAccountsState';
import { useUserImport } from './users/useUserImport';

export default function UserAccounts() {
  const navigate = useNavigate();
  const s = useUserAccountsState();
  const imp = useUserImport();
  const { usersQuery } = s;

  const columns = useMemo(
    () =>
      createUserAccountColumns({
        myId: s.me?.id,
        onView: s.setDetailId,
        onRole: s.setRoleChange,
        onResetPassword: (user) => s.askReset([user]),
        onAssignments: (path, state) => navigate(path, { state }),
        onToggle: (user) =>
          s.setConfirm({
            ids: [user.id],
            status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
            label: user.fullName,
          }),
        onDelete: (user) => s.askDelete([user]),
      }),
    [navigate, s.me?.id],
  );

  const handleCreated = async (name: string) => {
    toast.success(`${name} was added.`);
    s.setCreating(false);
    await usersQuery.refetch();
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <input
        ref={imp.inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          void imp.handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <UserAccountsHeader
        studentCount={s.studentCount.data}
        advisorCount={s.advisorCount.data}
        activeCount={s.activeCount.data}
        suspendedCount={s.suspendedCount.data}
        activeRole={s.role}
        activeStatus={s.status}
        onSelectRole={s.resetPage(s.setRole)}
        onSelectStatus={s.resetPage(s.setStatus)}
        onClearAll={s.clearFilters}
        onCreate={() => s.setCreating(true)}
        onExport={() => void s.runExportCsv()}
        isExporting={s.isExporting}
        canExport={s.total > 0}
        onImportStudents={imp.openStudentPicker}
        onImportAdvisors={imp.openAdvisorPicker}
        isImporting={imp.isImporting}
        importExamples={imp.examples}
      />

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <UserAccountsFilterBar
          search={s.search}
          role={s.role}
          status={s.status}
          majorId={s.majorId}
          cohortId={s.cohortId}
          majors={s.majors.data ?? []}
          cohortOptions={s.cohortOptions}
          hasFilters={s.hasFilters}
          onSearchChange={s.resetPage(s.setSearch)}
          onRoleChange={s.resetPage(s.setRole)}
          onStatusChange={s.resetPage(s.setStatus)}
          onMajorChange={(val) => {
            s.resetPage(s.setMajorId)(val);
            s.setCohortId('');
          }}
          onCohortChange={(val) => {
            s.resetPage(s.setCohortId)(val);
          }}
          onClear={s.clearFilters}
        />

        {usersQuery.isError && !usersQuery.data ? (
          <UserAccountsErrorState onRetry={() => usersQuery.refetch()} />
        ) : (
          <div className="relative">
            {usersQuery.isFetching && !usersQuery.isLoading && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <DataTable
              className="h-[calc(100vh-295px)] min-h-[460px]"
              manual
              columns={columns}
              data={s.items}
              searchKey="fullName"
              showSearch={false}
              emptyText={s.hasFilters ? 'No accounts match your filters.' : 'No accounts yet.'}
              getRowId={(row) => row.id}
              isLoading={usersQuery.isLoading}
              totalRowCount={s.total}
              onFetchAllRows={async () => {
                const res = await adminService.getUsers({
                  page: 0,
                  size: Math.min(s.total || 500, 500),
                  search: s.search.trim() || undefined,
                  role: s.role || undefined,
                  status: s.status || undefined,
                  majorId: s.majorId || undefined,
                  curriculumVersionId: s.cohortId || undefined,
                });
                return res.items.filter((row) => canResetPassword(row));
              }}
              isRowSelectable={(row) => canResetPassword(row)}
              rowSelectDisabledReason={() => NO_PASSWORD_REASON}
              pagination={s.pagination}
              onPaginationChange={s.setPagination}
              sorting={s.sorting}
              onSortingChange={s.setSorting}
              showPageSizeSelect={false}
              showPageJump
              bulkActions={(selectedRows) => (
                <UserBulkActions
                  selectedRows={selectedRows}
                  onSetRole={s.setBulkRoleTargets}
                  onResetPassword={s.askReset}
                  onActivate={(rows) => s.askBulk(rows, 'ACTIVE')}
                  onSuspend={(rows) => s.askBulk(rows, 'SUSPENDED')}
                  onDelete={s.askDelete}
                />
              )}
            />
          </div>
        )}
      </section>

      <UserAccountsModals
        detailId={s.detailId}
        onCloseDetail={() => s.setDetailId(null)}
        creating={s.creating}
        defaultCreateRole={s.role === 'ADVISOR' ? 'ADVISOR' : 'STUDENT'}
        onCloseCreate={() => s.setCreating(false)}
        onCreated={handleCreated}
        roleChange={s.roleChange}
        onCloseRoleChange={() => s.setRoleChange(null)}
        bulkRoleTargets={s.bulkRoleTargets}
        onCloseBulkRole={() => s.setBulkRoleTargets(null)}
        onRoleDone={() => void usersQuery.refetch()}
        resetTargets={s.resetTargets}
        resetPending={s.resetPasswords.isPending}
        resetError={s.resetError ?? s.resetPasswords.error}
        onConfirmReset={() => void s.runReset()}
        onCancelReset={() => {
          s.setResetTargets(null);
          s.setResetError(null);
        }}
        resetResults={s.resetResults}
        onCloseResetResults={() => {
          s.setResetResults(null);
          s.setResetError(null);
        }}
        confirm={s.confirm}
        changeStatusPending={s.changeStatus.isPending}
        onConfirmStatus={s.runConfirm}
        onCancelStatus={() => s.setConfirm(null)}
        deleteTargets={s.deleteTargets}
        deletePending={s.deleteUsers.isPending}
        onConfirmDelete={s.runDelete}
        onCancelDelete={() => s.setDeleteTargets(null)}
        importIssues={imp.issues}
        importExamples={imp.examples}
        onCloseImportIssues={imp.clearIssues}
      />

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
