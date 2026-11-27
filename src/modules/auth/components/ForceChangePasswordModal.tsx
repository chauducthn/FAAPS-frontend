import { useState, type FormEvent } from 'react';
import { Eye, EyeSlash, Key as KeyRound, SpinnerGap as Loader2, SignOut as LogOut } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { InlineAlert } from '@/shared/components/ui/InlineAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '@/shared/components/ui/ModalParts';
import { authService } from '../services/authService';
import { useAuth } from '../stores/useAuth';
import { passwordSchema } from '../validations/register.schema';

const INPUT_CLASS =
  'h-9 w-full rounded-md border border-line bg-white pl-3 pr-9 text-[13px] text-ink-primary ' +
  'placeholder:text-ink-subtle transition-colors hover:border-ink-subtle/50 ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

const TOGGLE_CLASS =
  'absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md ' +
  'text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-primary';

export function ForceChangePasswordModal() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const clearAuth = useAuth((s) => s.logout);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user?.mustChangePassword) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Password does not meet complexity requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword(undefined, newPassword);
      setUser({ ...user, mustChangePassword: false });
      toast.success('Password updated. Welcome to FAAPS.');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <Modal open onClose={() => {}} title="Change your default password" className="max-w-md">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col" noValidate>
        <ModalHeader
          title="Change your default password"
          description="Set a personal password before using FAAPS for the first time."
          icon={<KeyRound />}
          tone="brand"
        />

        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="fcp-new" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              New password <span className="text-brand">*</span>
            </label>
            <div className="relative">
              <input
                id="fcp-new"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="At least 8 chars, upper, lower, digit, symbol"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                className={TOGGLE_CLASS}
              >
                {showNew ? <EyeSlash className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="fcp-confirm" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Confirm new password <span className="text-brand">*</span>
            </label>
            <div className="relative">
              <input
                id="fcp-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Repeat your new password"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className={TOGGLE_CLASS}
              >
                {showConfirm ? <EyeSlash className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </div>

          {error && (
            <InlineAlert tone="error" role="alert">
              {error}
            </InlineAlert>
          )}
        </ModalBody>

        <ModalFooter
          start={
            <button
              type="button"
              onClick={handleSignOut}
              disabled={submitting}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          }
        >
          <button
            type="submit"
            disabled={submitting}
            className={modalButtonClass('primary')}
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Update password
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
