import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvelopeSimple as Mail } from '@phosphor-icons/react';
import { readApiMessage } from '@/shared/lib/apiMessage';
import { authService } from '../services/authService';
import { AuthAlert } from '../components/AuthAlert';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import {
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from '../components/authFormStyles';
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
    <AuthLayout
      title={submittedEmail ? 'Check your inbox' : 'Forgot your password?'}
      description={
        submittedEmail
          ? undefined
          : 'Enter your account email and we will send you a link to reset your password.'
      }
      back={{ to: '/login', label: 'Back to sign in' }}
    >
      {submittedEmail ? (
        <div className="space-y-6" data-testid="forgot-password-success">
          <AuthAlert tone="success" title="Reset link sent">
            <p>
              {serverMessage ?? 'If an active account with that email exists, password reset instructions have been sent.'}
            </p>
            <p className="mt-2 text-xs opacity-80">
              Sent to <span className="font-semibold">{submittedEmail}</span>. The link expires in 30 minutes.
            </p>
          </AuthAlert>

          <div className="flex flex-col gap-3">
            <Link viewTransition to="/login" className={authPrimaryButtonClass}>
              Return to sign in
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedEmail(null);
                setServerMessage(null);
              }}
              className={authSecondaryButtonClass}
            >
              Try another email
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <AuthAlert tone="error" role="alert">
              {submitError}
            </AuthAlert>
          )}

          <AuthField label="Email address" htmlFor="forgot-email" error={errors.email?.message}>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`${authInputClass} pl-10`}
                placeholder="name@fpt.edu.vn"
              />
            </div>
          </AuthField>

          <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
            {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
