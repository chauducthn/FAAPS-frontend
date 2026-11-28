import { useState } from 'react';
import { Key as KeyRound, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { profileService } from '@/shared/services/profileService';
import { modalButtonClass } from '@/shared/components/ui/ModalParts';
import { ProfileCard, profileFieldErrorClass, profileInputClass, profileLabelClass } from './ProfileCard';

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
      <ProfileCard title="Password & security">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ink-subtle" aria-hidden />
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Your account signs in through Google. Manage your password in your Google account settings.
          </p>
        </div>
      </ProfileCard>
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
    <form onSubmit={handleSubmit} noValidate>
      <ProfileCard
        title="Change password"
        description="Use at least 8 characters with a mix of letters and numbers."
        footer={
          <button type="submit" disabled={!canSubmit} className={modalButtonClass('primary')}>
            <KeyRound className="size-4" aria-hidden />
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        }
      >
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <label className={`${profileLabelClass} sm:col-span-2`}>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={profileInputClass}
            />
          </label>

          <label className={profileLabelClass}>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={!lengthValid}
              className={profileInputClass}
            />
            {!lengthValid && <span className={profileFieldErrorClass}>Password must be at least 8 characters.</span>}
          </label>

          <label className={profileLabelClass}>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={!matchValid}
              className={profileInputClass}
            />
            {!matchValid && <span className={profileFieldErrorClass}>Passwords do not match.</span>}
          </label>
        </div>
      </ProfileCard>
    </form>
  );
}
