import { Link } from 'react-router';
import { Logo } from '@/components/common/Logo';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../../validations/auth.schema';
import { useAuthMutations } from '../../hooks/useAuthMutations';

export default function Login() {
  const { loginAdmin, loginGoogle, globalError } = useAuthMutations();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

        {globalError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
            {globalError}
          </div>
        )}

        {/* Google sign-in button */}
        <div className="mt-8">
          <button
            onClick={() => loginGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
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

        <form onSubmit={handleSubmit(loginAdmin)} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all"
              placeholder="admin@fpt.edu.vn"
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
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-lg bg-orange-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 transition-all"
          >
            {isSubmitting ? 'Processing...' : 'Sign in'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}