import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Logo } from '@/shared/components/common/Logo';
import { AlertCircle, ArrowLeft, Info, X } from 'lucide-react';
import { loginNoticeFromParam } from '@/shared/lib/authErrors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../validations/auth.schema';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';

export default function Login() {
  const { loginAdmin, loginGoogle, isAdminLoading, adminNotice, resetAdminError } = useAuthMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramNotice = loginNoticeFromParam(searchParams.get('error'));
  const [paramDismissed, setParamDismissed] = useState(false);
  const notice = adminNotice ?? (paramDismissed ? null : paramNotice);

  const clearErrorParam = () => {
    if (!searchParams.has('error')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('error');
    setSearchParams(next, { replace: true });
  };

  // A new sign-in attempt replaces the message that brought the user here.
  useEffect(() => {
    if (adminNotice) clearErrorParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminNotice]);

  const dismiss = () => {
    resetAdminError();
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-sm border border-gray-200">
        <div className="text-center">
          <Logo className="mb-2 justify-center" />
          <p className="mt-2 text-sm text-gray-500">Academic Advising & Planning System</p>
        </div>

        {notice && (
          <div
            role="alert"
            data-testid="login-notice"
            className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm ${
              notice.tone === 'info' ? 'border-blue-100 bg-blue-50 text-blue-800' : 'border-red-100 bg-red-50 text-red-700'
            }`}
          >
            {notice.tone === 'info' ? <Info className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-0.5">{notice.message}</p>
            </div>
            <button type="button" onClick={dismiss} aria-label="Dismiss message" className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={() => loginGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => loginAdmin(data))} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin username or email</label>
            <input
              {...register('email')}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all"
              placeholder="admin"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isAdminLoading}
            className="flex w-full justify-center rounded-lg bg-orange-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 transition-all"
          >
            {isAdminLoading ? 'Processing...' : 'Sign in'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
