import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeSlash as EyeOff, Key as KeyRound, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { readApiMessage } from '@/shared/lib/apiMessage';
import { authService } from '../services/authService';
import { AuthAlert } from '../components/AuthAlert';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { authInputClass, authPrimaryButtonClass } from '../components/authFormStyles';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../validations/auth.schema';

const TOGGLE_VISIBILITY_CLASS =
  'absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-ink-subtle ' +
  'transition-colors hover:text-ink-primary';

type TokenState = 'checking' | 'valid' | 'invalid';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') ?? '').trim();
  const [tokenState, setTokenState] = useState<TokenState>(token ? 'checking' : 'invalid');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    let active = true;
    authService
      .validateResetToken(token)
      .then((res) => {
        if (active) setTokenState(res.valid ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (active) setTokenState('invalid');
      });
    return () => {
      active = false;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError(null);
    try {
      await authService.resetPassword(token, values.newPassword);
      setDone(true);
    } catch (error) {
      setSubmitError(readApiMessage(error, 'Could not reset password. Your link may have expired.'));
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a strong password with at least 8 characters, including letters and numbers."
      back={{ to: '/login', label: 'Back to sign in' }}
    >
      {tokenState === 'checking' && (
        <div className="flex items-center gap-3 rounded-md border border-line px-4 py-5 text-sm text-ink-muted">
          <Loader2 className="size-5 animate-spin text-brand" aria-hidden />
          <span>Verifying your reset link...</span>
        </div>
      )}

      {tokenState === 'invalid' && (
        <div className="space-y-6" data-testid="reset-password-invalid">
          <AuthAlert tone="error" title="Reset link invalid or expired">
            This password reset link is missing, has already been used, or has expired.
          </AuthAlert>
          <Link viewTransition to="/forgot-password" className={authPrimaryButtonClass}>
            Request a new reset link
          </Link>
        </div>
      )}

      {tokenState === 'valid' && done && (
        <div className="space-y-6" data-testid="reset-password-success">
          <AuthAlert tone="success" title="Password updated">
            Your password has been reset. You can now sign in with your new password.
          </AuthAlert>
          <Link viewTransition to="/login?reset=success" className={authPrimaryButtonClass}>
            Sign in now
          </Link>
        </div>
      )}

      {tokenState === 'valid' && !done && (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <AuthAlert tone="error" role="alert">
              {submitError}
            </AuthAlert>
          )}

          <AuthField label="New password" htmlFor="reset-new-password" error={errors.newPassword?.message}>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('newPassword')}
                className={`${authInputClass} pl-10 pr-11`}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className={TOGGLE_VISIBILITY_CLASS}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </AuthField>

          <AuthField label="Confirm new password" htmlFor="reset-confirm-password" error={errors.confirmPassword?.message}>
            <input
              id="reset-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={authInputClass}
              placeholder="Re-enter your new password"
            />
          </AuthField>

          <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
            {isSubmitting ? 'Updating password...' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
