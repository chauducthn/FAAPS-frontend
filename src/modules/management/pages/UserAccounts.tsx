import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeftRight, CheckCircle2, KeyRound, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { NO_PASSWORD_REASON } from '../components/UserRowMenu';
import { canResetPassword } from '../utils/passwordReset';
import { DataTable } from '../../../shared/components/common/DataTable';
import { createUserAccountColumns } from './users/userAccountColumns';
import { UserAccountsHeader } from './users/UserAccountsHeader';
import { UserAccountsErrorState, UserAccountsFilterBar } from './users/UserAccountsFilterBar';
import { UserAccountsModals } from './users/UserAccountsModals';
import { useUserAccountsState } from './users/useUserAccountsState';

export default function UserAccounts() {
  const navigate = useNavigate();
  const s = useUserAccountsState();
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
            s.setMajorId('');
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
              className="flex min-h-[540px] flex-col justify-between"
              manual
              columns={columns}
              data={s.items}
              searchKey="fullName"
              showSearch={false}
              emptyText={s.hasFilters ? 'No accounts match your filters.' : 'No accounts yet.'}
              getRowId={(row) => row.id}
              isLoading={usersQuery.isLoading}
              totalRowCount={s.total}
              isRowSelectable={(row) => canResetPassword(row)}
              rowSelectDisabledReason={() => NO_PASSWORD_REASON}
              pagination={s.pagination}
              onPaginationChange={s.setPagination}
              sorting={s.sorting}
              onSortingChange={s.setSorting}
              showPageSizeSelect={false}
              showPageJump
              bulkActions={(selectedRows) => (
                <>
                  <button
                    type="button"
                    onClick={() => s.setBulkRoleTargets(selectedRows)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <ArrowLeftRight className="size-3.5" aria-hidden /> Set role
                  </button>
                  <button
                    type="button"
                    onClick={() => s.askReset(selectedRows)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <KeyRound className="size-3.5" aria-hidden /> Reset password
                  </button>
                  <button
                    type="button"
                    onClick={() => s.askBulk(selectedRows, 'ACTIVE')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="size-3.5" aria-hidden /> Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => s.askBulk(selectedRows, 'SUSPENDED')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    <ShieldOff className="size-3.5" aria-hidden /> Suspend
                  </button>
                </>
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
      />

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
