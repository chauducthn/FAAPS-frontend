import { Link } from 'react-router';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';

const STEPS = [
  {
    title: 'Sign up with Google',
    text: 'Use your own Google account. FAAPS never asks you to create a password.',
  },
  {
    title: 'Your Student account is created',
    text: 'The first sign-in creates the account automatically with your Google name and email.',
  },
  {
    title: 'An administrator links your academic profile',
    text: 'Your Student ID, major and curriculum are assigned by an administrator before you can use all features.',
  },
];

// The backend has no separate sign-up endpoint: the first Google sign-in creates the Student account.
export default function Register() {
  const { loginGoogle } = useAuthMutations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="text-center">
            <Logo className="mb-2 justify-center" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Create your student account</h1>
            <p className="mt-2 text-sm text-gray-500">Academic Advising & Planning System</p>
          </div>

          <ol className="space-y-4" aria-label="How registration works">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => loginGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-5 w-5" />
            Sign up with Google
          </button>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gray-400" />
              Advisor accounts are created by an administrator. If you are an advisor, just sign in with the email you were given.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gray-400" />
              Already registered by an administrator? Signing up with the same email connects to that account.
            </p>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
