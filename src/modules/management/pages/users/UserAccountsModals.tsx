import { CheckCircle, ShieldSlash, Trash } from '@phosphor-icons/react';
import { UserDetailModal } from '../../components/UserDetailModal';
import { CreateUserModal } from '../../components/CreateUserModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SetRoleModal } from '../../components/SetRoleModal';
import { BulkSetRoleModal } from '../../components/BulkSetRoleModal';
import { ResetPasswordConfirmDialog, type ResetPasswordTarget } from '../../components/ResetPasswordConfirmDialog';
import { ResetPasswordResultModal } from '../../components/ResetPasswordResultModal';
import { ImportCheckDialog, type ExampleSheet } from '../../components/ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
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
  importIssues,
  importExamples,
  onCloseImportIssues,
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
  importIssues: { fileName: string; problems: ImportProblem[] } | null;
  importExamples: ExampleSheet[];
  onCloseImportIssues: () => void;
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
        title={
          confirm?.status === 'SUSPENDED'
            ? confirm.ids.length > 1 ? 'Suspend accounts?' : 'Suspend account?'
            : confirm && confirm.ids.length > 1 ? 'Activate accounts?' : 'Activate account?'
        }
        message={
          confirm?.status === 'SUSPENDED'
            ? 'Suspended users lose access to FAAPS immediately until reactivated.'
            : 'Activated users will be able to sign in to FAAPS again.'
        }
        targetHeading={confirm && confirm.ids.length > 1 ? 'Selected accounts' : 'Account'}
        targetLabel={confirm?.label}
        metaHeading="New status"
        metaValue={
          confirm?.status === 'SUSPENDED' ? (
            <span className="rounded-sm bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Suspended</span>
          ) : (
            <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>
          )
        }
        icon={confirm?.status === 'SUSPENDED' ? <ShieldSlash /> : <CheckCircle />}
        tone={confirm?.status === 'SUSPENDED' ? 'warning' : 'brand'}
        confirmLabel={confirm?.status === 'SUSPENDED' ? 'Suspend' : 'Activate'}
        destructive={confirm?.status === 'SUSPENDED'}
        isLoading={changeStatusPending}
        onConfirm={onConfirmStatus}
        onCancel={onCancelStatus}
      />

      <ConfirmDialog
        open={!!deleteTargets}
        title={deleteTargets && deleteTargets.ids.length > 1 ? 'Delete accounts?' : 'Delete account?'}
        message="This action permanently removes the selected account and cannot be undone."
        targetHeading={deleteTargets && deleteTargets.ids.length > 1 ? 'Selected accounts' : 'Account'}
        targetLabel={deleteTargets?.label}
        icon={<Trash />}
        tone="danger"
        confirmLabel="Delete"
        destructive
        isLoading={deletePending}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <ImportCheckDialog
        open={!!importIssues}
        fileName={importIssues?.fileName ?? ''}
        problems={importIssues?.problems ?? []}
        examples={importExamples}
        onClose={onCloseImportIssues}
      />
    </>
  );
}
