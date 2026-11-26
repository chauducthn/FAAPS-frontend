import { useState } from 'react';
import { Key as KeyRound, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { profileService } from '@/shared/services/profileService';

interface ChangePasswordCardProps {
  authProvider?: string | null;
}

export function ChangePasswordCard({ authProvider }: ChangePasswordCardProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authProvider?.toUpperCase() === 'GOOGLE') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Password & security</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your account signs in through Google. Manage your password in your Google account settings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const lengthValid = newPassword.length === 0 || newPassword.length >= 8;
  const matchValid = confirmPassword.length === 0 || newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-[var(--brand)]" aria-hidden />
        <h2 className="text-base font-bold text-slate-900">Change password</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Use at least 8 characters with a mix of letters and numbers.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <label className="block text-xs font-semibold text-slate-700">
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={!lengthValid}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)] aria-[invalid=true]:border-red-400"
            />
            {!lengthValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Password must be at least 8 characters.
              </span>
            )}
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={!matchValid}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)] aria-[invalid=true]:border-red-400"
            />
            {!matchValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Passwords do not match.
              </span>
            )}
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>
    </section>
  );
}
