import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { NO_PASSWORD_REASON } from '../components/UserRowMenu';
import { canResetPassword } from '../utils/passwordReset';
import { DataTable } from '../../../shared/components/common/DataTable';
import { createUserAccountColumns } from './users/userAccountColumns';
import {
  UserAccountsErrorState,
  UserAccountsFilterBar,
  UserAccountsHeader,
  UserAccountsKpiStrip,
} from './users/UserAccountsHeaderAndFilters';
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
        onAssignments: (id, state) => navigate(`/admin/assignments/advisors/${id}`, { state }),
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
    <div className="w-full space-y-5">
      <UserAccountsHeader onCreate={() => s.setCreating(true)} />
      <UserAccountsKpiStrip
        studentCount={s.studentCount.data}
        advisorCount={s.advisorCount.data}
        total={s.total}
      />
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

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
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
                    onClick={() => s.askReset(selectedRows)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#151c27] ring-1 ring-[#e5e7eb] transition-colors hover:bg-gray-50"
                  >
                    <KeyRound className="size-4" aria-hidden /> Reset password
                  </button>
                  <button
                    type="button"
                    onClick={() => s.askBulk(selectedRows, 'SUSPENDED')}
                    className="rounded-lg bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-red-100"
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => s.askBulk(selectedRows, 'ACTIVE')}
                    className="rounded-lg bg-[#ecfdf5] px-4 py-2 text-sm font-semibold text-[#047857] hover:bg-emerald-100"
                  >
                    Activate
                  </button>
                </>
              )}
            />
          </div>
        )}
      </div>

      <UserAccountsModals
        detailId={s.detailId}
        onCloseDetail={() => s.setDetailId(null)}
        creating={s.creating}
        defaultCreateRole={s.role === 'ADVISOR' ? 'ADVISOR' : 'STUDENT'}
        onCloseCreate={() => s.setCreating(false)}
        onCreated={handleCreated}
        roleChange={s.roleChange}
        onCloseRoleChange={() => s.setRoleChange(null)}
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
