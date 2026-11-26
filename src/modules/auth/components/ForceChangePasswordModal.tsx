import { useState, type FormEvent } from 'react';
import { Warning as AlertTriangle, Key as KeyRound, SpinnerGap as Loader2, SignOut as LogOut } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { authService } from '../services/authService';
import { useAuth } from '../stores/useAuth';
import { passwordSchema } from '../validations/register.schema';

const inputClass =
  'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-orange-100';

export function ForceChangePasswordModal() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const clearAuth = useAuth((s) => s.logout);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user?.mustChangePassword) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentPassword) {
      setError('Enter your current default password.');
      return;
    }
    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Password does not meet complexity requirements.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-change-pw-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 id="force-change-pw-title" className="text-base font-bold text-gray-900">
              Change your default password
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              For your security, please set a personal password before using FAAPS for the first time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
          <div>
            <label htmlFor="fcp-current" className="mb-1.5 block text-xs font-semibold text-gray-700">
              Current password
            </label>
            <input
              id="fcp-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your default password"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fcp-new" className="mb-1.5 block text-xs font-semibold text-gray-700">
              New password
            </label>
            <input
              id="fcp-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars, upper, lower, digit, symbol"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fcp-confirm" className="mb-1.5 block text-xs font-semibold text-gray-700">
              Confirm new password
            </label>
            <input
              id="fcp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#F26F21] px-4 text-sm font-semibold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
