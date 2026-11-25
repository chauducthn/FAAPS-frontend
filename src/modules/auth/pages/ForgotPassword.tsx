import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { readApiMessage } from '@/shared/lib/apiMessage';
import { authService } from '../services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../validations/auth.schema';

export default function ForgotPassword() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitError(null);
    try {
      const result = await authService.forgotPassword(values.email);
      setSubmittedEmail(values.email);
      setServerMessage(result.message);
    } catch (error) {
      setSubmitError(readApiMessage(error, 'Could not process your request. Please try again.'));
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
            <h1 className="mt-4 text-xl font-bold text-gray-900">Forgot your password?</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your account email and we will send you a link to reset your password.
            </p>
          </div>

          {submittedEmail ? (
            <div className="space-y-5" data-testid="forgot-password-success">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold">Check your inbox</p>
                  <p className="text-emerald-800">
                    {serverMessage ??
                      'If an active account with that email exists, password reset instructions have been sent.'}
                  </p>
                  <p className="pt-1 text-xs text-emerald-700">
                    Sent to <span className="font-semibold">{submittedEmail}</span>. The link expires in 30 minutes.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700"
                >
                  Return to sign in
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedEmail(null);
                    setServerMessage(null);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
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
                <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm"
                    placeholder="name@fpt.edu.vn"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
              >
                {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
