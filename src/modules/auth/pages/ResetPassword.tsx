import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { readApiMessage } from '@/shared/lib/apiMessage';
import { authService } from '../services/authService';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../validations/auth.schema';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        <div className="w-full space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <Logo className="mb-2 justify-center" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Set a new password</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Choose a strong password with at least 8 characters, including letters and numbers.
            </p>
          </div>

          {tokenState === 'checking' && (
            <div className="flex flex-col items-center gap-3 py-8 text-sm text-gray-500">
              <Loader2 className="size-6 animate-spin text-orange-600" />
              <span>Verifying your reset link...</span>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="space-y-5" data-testid="reset-password-invalid">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold">Reset link invalid or expired</p>
                  <p className="mt-1 text-red-700">
                    This password reset link is missing, has already been used, or has expired.
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          {tokenState === 'valid' && done && (
            <div className="space-y-5" data-testid="reset-password-success">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">Password updated</p>
                  <p className="mt-1 text-emerald-800">
                    Your password has been reset. You can now sign in with your new password.
                  </p>
                </div>
              </div>
              <Link
                to="/login?reset=success"
                className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700"
              >
                Sign in now
              </Link>
            </div>
          )}

          {tokenState === 'valid' && !done && (
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-new-password" className="mb-1 block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('newPassword')}
                    className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="reset-confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm new password
                </label>
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm"
                  placeholder="Re-enter your new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
              >
                {isSubmitting ? 'Updating password...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
