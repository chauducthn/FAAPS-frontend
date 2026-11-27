// Confirmation dialog for resetting one or more accounts to the default password (FPTUniversity@2026).

import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeSlash, Key as KeyRound, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { Modal } from '../../../shared/components/ui/Modal';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';

export interface ResetPasswordTarget {
  id: string;
  fullName: string;
  email: string;
}

interface Props {
  open: boolean;
  users: ResetPasswordTarget[];
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string | null;
}

const DEFAULT_PASSWORD = 'FPTUniversity@2026';

export function ResetPasswordConfirmDialog({ open, users, onConfirm, onCancel, isPending, error }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) setShowPassword(false);
  }, [open]);

  const isSingle = users.length === 1;
  const heading = useMemo(
    () => (isSingle ? 'Reset this password?' : `Reset ${users.length} passwords?`),
    [isSingle, users.length],
  );
  const singleUser = isSingle ? users[0] : null;

  return (
    <Modal open={open} onClose={isPending ? () => {} : onCancel} title={heading} className="max-w-md">
      <ModalHeader
        title={heading}
        description="Selected accounts will be reset to the default password and prompted to change it on next sign-in."
        icon={<KeyRound />}
        tone="warning"
        onClose={onCancel}
        closeDisabled={isPending}
      />

      <ModalBody className="flex flex-col gap-3">
        <div className="divide-y divide-line-soft overflow-hidden rounded-lg bg-surface-page ring-1 ring-inset ring-line-soft">
          {singleUser ? (
            <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
              <span className="min-w-0 truncate text-[13px] font-semibold text-ink-primary">{singleUser.fullName}</span>
              <span className="min-w-0 truncate font-mono text-[12px] text-ink-muted">{singleUser.email}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                Selected accounts
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-ink-primary">
                {users.length} accounts
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Default password
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-sm bg-white px-2 py-0.5 font-mono text-[12.5px] font-semibold text-ink-primary ring-1 ring-line">
                {showPassword ? DEFAULT_PASSWORD : '••••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide default password' : 'Show default password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="inline-flex size-7 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-primary"
              >
                {showPassword ? <EyeSlash className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={isPending} onClick={onCancel} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onConfirm}
          className={modalButtonClass('danger')}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Reset password
        </button>
      </ModalFooter>
    </Modal>
  );
}
