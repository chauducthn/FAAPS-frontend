import { useState } from 'react';
import { Key as KeyRound, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { profileService } from '@/shared/services/profileService';

interface ChangePasswordCardProps {
  authProvider?: string | null;
}

const inputCls =
  'mt-1.5 h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-colors focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/15 aria-[invalid=true]:border-red-400';

export function ChangePasswordCard({ authProvider }: ChangePasswordCardProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authProvider?.toUpperCase() === 'GOOGLE') {
    return (
      <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <ShieldCheck className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Password &amp; security</h2>
            <p className="mt-1 text-xs text-gray-500">
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
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <KeyRound className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Change password</h2>
          <p className="text-xs text-gray-500">Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
        <label className="block text-xs font-semibold text-gray-700">
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={inputCls}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-gray-700">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={!lengthValid}
              className={inputCls}
            />
            {!lengthValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Password must be at least 8 characters.
              </span>
            )}
          </label>

          <label className="block text-xs font-semibold text-gray-700">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={!matchValid}
              className={inputCls}
            />
            {!matchValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Passwords do not match.
              </span>
            )}
          </label>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-9 rounded-lg bg-gray-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </section>
  );
}
