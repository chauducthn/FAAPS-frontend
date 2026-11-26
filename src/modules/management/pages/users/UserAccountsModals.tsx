import { UserDetailModal } from '../../components/UserDetailModal';
import { CreateUserModal } from '../../components/CreateUserModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SetRoleModal } from '../../components/SetRoleModal';
import { BulkSetRoleModal } from '../../components/BulkSetRoleModal';
import { ResetPasswordConfirmDialog, type ResetPasswordTarget } from '../../components/ResetPasswordConfirmDialog';
import { ResetPasswordResultModal } from '../../components/ResetPasswordResultModal';
import type { AdminUserRole, AdminUserSummary, PasswordResetEntry } from '../../types/admin';

export function UserAccountsModals({
  detailId,
  onCloseDetail,
  creating,
  defaultCreateRole,
  onCloseCreate,
  onCreated,
  roleChange,
  onCloseRoleChange,
  bulkRoleTargets,
  onCloseBulkRole,
  onRoleDone,
  resetTargets,
  resetPending,
  resetError,
  onConfirmReset,
  onCancelReset,
  resetResults,
  onCloseResetResults,
  confirm,
  changeStatusPending,
  onConfirmStatus,
  onCancelStatus,
  deleteTargets,
  deletePending,
  onConfirmDelete,
  onCancelDelete,
}: {
  detailId: string | null;
  onCloseDetail: () => void;
  creating: boolean;
  defaultCreateRole: AdminUserRole;
  onCloseCreate: () => void;
  onCreated: (name: string) => Promise<void>;
  roleChange: AdminUserSummary | null;
  onCloseRoleChange: () => void;
  bulkRoleTargets: AdminUserSummary[] | null;
  onCloseBulkRole: () => void;
  onRoleDone: () => void;
  resetTargets: ResetPasswordTarget[] | null;
  resetPending: boolean;
  resetError: string | null;
  onConfirmReset: () => void;
  onCancelReset: () => void;
  resetResults: PasswordResetEntry[] | null;
  onCloseResetResults: () => void;
  confirm: { ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null;
  changeStatusPending: boolean;
  onConfirmStatus: () => Promise<void>;
  onCancelStatus: () => void;
  deleteTargets: { ids: string[]; label: string } | null;
  deletePending: boolean;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
}) {
  return (
    <>
      <UserDetailModal userId={detailId} onClose={onCloseDetail} />

      <CreateUserModal
        open={creating}
        defaultRole={defaultCreateRole}
        onClose={onCloseCreate}
        onCreated={onCreated}
      />

      <SetRoleModal
        open={!!roleChange}
        user={roleChange}
        onClose={onCloseRoleChange}
        onDone={onRoleDone}
      />

      <BulkSetRoleModal
        targets={bulkRoleTargets}
        onClose={onCloseBulkRole}
        onDone={onRoleDone}
      />

      <ResetPasswordConfirmDialog
        open={!!resetTargets}
        users={resetTargets ?? []}
        isPending={resetPending}
        error={resetError}
        onConfirm={onConfirmReset}
        onCancel={onCancelReset}
      />

      <ResetPasswordResultModal
        open={!!resetResults}
        results={resetResults ?? []}
        onClose={onCloseResetResults}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.status === 'SUSPENDED' ? 'Suspend accounts?' : 'Activate accounts?'}
        message={
          confirm?.status === 'SUSPENDED'
            ? `${confirm.label} will lose access to FAAPS immediately.`
            : `${confirm?.label ?? ''} will be able to sign in again.`
        }
        confirmLabel={confirm?.status === 'SUSPENDED' ? 'Suspend' : 'Activate'}
        destructive={confirm?.status === 'SUSPENDED'}
        isLoading={changeStatusPending}
        onConfirm={onConfirmStatus}
        onCancel={onCancelStatus}
      />

      <ConfirmDialog
        open={!!deleteTargets}
        title={deleteTargets && deleteTargets.ids.length > 1 ? 'Delete accounts?' : 'Delete account?'}
        message={`Permanently delete ${deleteTargets?.label ?? ''}? Accounts with existing academic or advising records cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isLoading={deletePending}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
