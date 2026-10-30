import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';
import { authService } from '@/modules/auth/services/authService';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { registerSchema, type RegisterInput, type RegisterValues } from '../validations/register.schema';

type Method = 'email' | 'google';

const input =
  'block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

function Field({ label, htmlFor, required, error, hint, children }: { label: string; htmlFor?: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-xs font-normal text-gray-400">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/** Registration page: create an account with email and password, or sign up with Google and add details after. */
export default function Register() {
  const [method, setMethod] = useState<Method>('email');
  const { loginGoogle } = useAuthMutations();
  const { setUser } = useAuth();
  const curriculums = useQuery({ queryKey: ['register', 'curriculums'], queryFn: () => authService.registerCurriculums(), staleTime: 5 * 60_000 });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', studentCode: '', dateOfBirth: '', email: '', phone: '', curriculumVersionId: '', password: '', confirmPassword: '' },
  });

  const submit = useMutation({
    mutationFn: (values: RegisterValues) =>
      authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        dateOfBirth: values.dateOfBirth,
        studentCode: values.studentCode,
        curriculumVersionId: values.curriculumVersionId,
        phone: values.phone || undefined,
      }),
    onSuccess: (user) => {
      setUser(user);
      window.location.assign('/student');
    },
    onError: (error) => setError('root', { message: apiErrorMessage(error) }),
  });

  const grouped = useMemo(() => {
    const byMajor = new Map<string, { label: string; items: NonNullable<typeof curriculums.data> }>();
    for (const item of curriculums.data ?? []) {
      const entry = byMajor.get(item.majorCode) ?? { label: `${item.majorCode} - ${item.majorName}`, items: [] };
      entry.items.push(item);
      byMajor.set(item.majorCode, entry);
    }
    return [...byMajor.values()];
  }, [curriculums.data]);

  const tab = (value: Method, label: string) => (
    <button
      key={value}
      type="button"
      role="tab"
      aria-selected={method === value}
      onClick={() => setMethod(value)}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        method === value ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-xl">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <Logo className="mb-2 justify-center" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Create your student account</h1>
            <p className="mt-2 text-sm text-gray-500">Academic Advising & Planning System</p>
          </div>

          <div role="tablist" aria-label="Registration method" className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {tab('email', 'Create an account')}
            {tab('google', 'Sign up with Google')}
          </div>

          {method === 'email' ? (
            <form noValidate onSubmit={handleSubmit((values) => submit.mutate(values))} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
                  <input id="fullName" {...register('fullName')} autoComplete="name" placeholder="Nguyen Van A" className={input} />
                </Field>
                <Field label="Student ID" htmlFor="studentCode" required error={errors.studentCode?.message}>
                  <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE173012" className={input} />
                </Field>
              </div>

              <Field label="Date of birth" required error={errors.dateOfBirth?.message}>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => <DateOfBirthField value={field.value} onChange={field.onChange} idPrefix="register-dob" />}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                  <input id="email" type="email" {...register('email')} autoComplete="email" placeholder="name@fpt.edu.vn" className={input} />
                </Field>
                <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
                  <input id="phone" {...register('phone')} autoComplete="tel" placeholder="0901234567" className={input} />
                </Field>
              </div>

              <Field label="Curriculum" htmlFor="curriculumVersionId" required error={errors.curriculumVersionId?.message}
                hint={!curriculums.isLoading && !curriculums.isError && grouped.length === 0 ? 'No curriculum is open for registration yet. Please contact an administrator.' : undefined}>
                <select id="curriculumVersionId" {...register('curriculumVersionId')} disabled={curriculums.isLoading} className={input}>
                  <option value="">{curriculums.isLoading ? 'Loading...' : 'Select your major and cohort...'}</option>
                  {grouped.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.version} - {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {curriculums.isError && <p className="mt-1 text-xs text-red-500">Could not load the curriculums. Please reload the page.</p>}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password" htmlFor="password" required error={errors.password?.message} hint="At least 8 characters with a letter and a digit.">
                  <input id="password" type="password" {...register('password')} autoComplete="new-password" className={input} />
                </Field>
                <Field label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
                  <input id="confirmPassword" type="password" {...register('confirmPassword')} autoComplete="new-password" className={input} />
                </Field>
              </div>

              {errors.root?.message && (
                <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errors.root.message}
                </p>
              )}

              <button
                type="submit"
                disabled={submit.isPending}
                className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:bg-orange-400"
              >
                {submit.isPending ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div role="note" className="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>
                  Sign in with your Google account first. Right after, you add your Student ID, date of birth and curriculum.
                  No password is needed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loginGoogle()}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-5 w-5" />
                Sign up with Google
              </button>
              <p className="text-center text-xs text-gray-500">
                Advisor accounts are created by an administrator. Advisors just sign in with the email they were given.
              </p>
            </div>
          )}

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
