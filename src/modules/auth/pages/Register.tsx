import { useMemo } from 'react';
import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';
import { authService } from '@/modules/auth/services/authService';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { registerSchema, type RegisterInput, type RegisterValues } from '../validations/register.schema';

const inputClass =
  'block h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {!required && <span className="text-[11px] text-gray-400">Optional</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/** Registration page: clean, compact, unified single-page layout. */
export default function Register() {
  const { loginGoogle } = useAuthMutations();
  const { setUser } = useAuth();
  const curriculums = useQuery({
    queryKey: ['register', 'curriculums'],
    queryFn: () => authService.registerCurriculums(),
    staleTime: 5 * 60_000,
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      studentCode: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      curriculumVersionId: '',
      password: '',
      confirmPassword: '',
    },
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-xl">
        <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-orange-600">
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <Logo className="mb-1.5 justify-center" />
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Create your student account</h1>
            <p className="mt-0.5 text-xs text-gray-500">Academic Advising & Planning System</p>
          </div>

          {/* Quick Google Sign up */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => loginGoogle()}
              className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="size-4" />
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-medium uppercase tracking-wider text-gray-400">
                or with email
              </span>
            </div>
          </div>

          {/* Direct Email Registration Form */}
          <form noValidate onSubmit={handleSubmit((values) => submit.mutate(values))} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
                <input id="fullName" {...register('fullName')} autoComplete="name" placeholder="Nguyen Van A" className={inputClass} />
              </Field>

              <Field label="Student ID" htmlFor="studentCode" required error={errors.studentCode?.message}>
                <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE173012" className={inputClass} />
              </Field>

              <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                <input id="email" type="email" {...register('email')} autoComplete="email" placeholder="name@fpt.edu.vn" className={inputClass} />
              </Field>

              <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
                <input id="phone" {...register('phone')} autoComplete="tel" placeholder="0901234567" className={inputClass} />
              </Field>

              <Field label="Date of birth" required error={errors.dateOfBirth?.message}>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => <DateOfBirthField value={field.value} onChange={field.onChange} idPrefix="register-dob" />}
                />
              </Field>

              <Field label="Curriculum / Major" htmlFor="curriculumVersionId" required error={errors.curriculumVersionId?.message}>
                <select id="curriculumVersionId" {...register('curriculumVersionId')} disabled={curriculums.isLoading} className={inputClass}>
                  <option value="">{curriculums.isLoading ? 'Loading...' : 'Select curriculum...'}</option>
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
                {curriculums.isError && <p className="mt-1 text-xs text-red-500">Could not load curriculums. Please reload.</p>}
              </Field>

              <Field label="Password" htmlFor="password" required error={errors.password?.message}>
                <input id="password" type="password" {...register('password')} autoComplete="new-password" placeholder="Min 8 chars, letter & digit" className={inputClass} />
              </Field>

              <Field label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
                <input id="confirmPassword" type="password" {...register('confirmPassword')} autoComplete="new-password" placeholder="Repeat your password" className={inputClass} />
              </Field>
            </div>

            {errors.root?.message && (
              <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submit.isPending}
              className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700 active:scale-[0.99] disabled:bg-orange-400"
            >
              {submit.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600 sm:text-sm">
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
