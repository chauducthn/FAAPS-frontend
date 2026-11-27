import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { loginNoticeFromParam } from '@/shared/lib/authErrors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../validations/auth.schema';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';
import { AuthAlert } from '../components/AuthAlert';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthDivider, GoogleAuthButton } from '../components/GoogleAuthButton';
import { authInputClass, authPrimaryButtonClass, authTextLinkClass } from '../components/authFormStyles';

export default function Login() {
  const { login, loginGoogle, isLoginLoading, loginNotice, resetLoginError } = useAuthMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramNotice = loginNoticeFromParam(searchParams.get('error'));
  const resetSuccess = searchParams.get('reset') === 'success';
  const [paramDismissed, setParamDismissed] = useState(false);
  const notice =
    loginNotice ??
    (paramDismissed
      ? null
      : paramNotice ??
        (resetSuccess
          ? {
              tone: 'info' as const,
              title: 'Password reset successful',
              message: 'You can now sign in with your new password.',
            }
          : null));

  const clearErrorParam = () => {
    if (!searchParams.has('error') && !searchParams.has('reset')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('error');
    next.delete('reset');
    setSearchParams(next, { replace: true });
  };

  // A new sign-in attempt replaces the message that brought the user here.
  useEffect(() => {
    if (loginNotice) clearErrorParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginNotice]);

  const dismiss = () => {
    resetLoginError();
    setParamDismissed(true);
    clearErrorParam();
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue planning your semesters with FAAPS."
      back={{ to: '/', label: 'Back to home' }}
      footer={
        <>
          New student?{' '}
          <Link viewTransition to="/register" className={authTextLinkClass}>
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {notice && (
          <AuthAlert tone={notice.tone} title={notice.title} role="alert" testId="login-notice" onDismiss={dismiss}>
            {notice.message}
          </AuthAlert>
        )}

        <GoogleAuthButton label="Sign in with Google" onClick={() => loginGoogle()} />

        <AuthDivider label="Or sign in with email" />

        <form noValidate onSubmit={handleSubmit((data) => login(data))} className="space-y-5">
          <AuthField label="Email" htmlFor="login-email" error={errors.email?.message}>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={authInputClass}
              placeholder="name@fpt.edu.vn"
            />
          </AuthField>

          <AuthField
            label="Password"
            htmlFor="login-password"
            error={errors.password?.message}
            aside={
              <Link viewTransition to="/forgot-password" className={`text-xs ${authTextLinkClass}`}>
                Forgot password?
              </Link>
            }
          >
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={authInputClass}
              placeholder="••••••••"
            />
          </AuthField>

          <button type="submit" disabled={isLoginLoading} className={authPrimaryButtonClass}>
            {isLoginLoading ? 'Processing...' : 'Sign in'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
