import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Logo } from '@/shared/components/common/Logo';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { authService } from '@/modules/auth/services/authService';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { onboardingService } from '../services/onboardingService';
import { ONBOARDING_KEYS, useCurriculumChoices, useRegistrationProfile } from '../hooks/queries/useStudentOnboarding';
import {
  completeRegistrationSchema,
  type CompleteRegistrationInput,
  type CompleteRegistrationValues,
} from '../validations/onboarding.schema';

const input =
  'block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

/** Step 2 of registration: choose the Student ID and curriculum after the first Google sign-in. */
export default function CompleteRegistration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const profile = useRegistrationProfile();
  const curriculums = useCurriculumChoices();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CompleteRegistrationInput, unknown, CompleteRegistrationValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: { studentCode: '', dateOfBirth: '', curriculumVersionId: '', phone: '' },
  });

  const save = useMutation({
    mutationFn: (values: CompleteRegistrationValues) =>
      onboardingService.complete({
        studentCode: values.studentCode,
        curriculumVersionId: values.curriculumVersionId,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone || undefined,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(ONBOARDING_KEYS.profile, saved);
      toast.success('Registration complete. Welcome to FAAPS!');
      navigate('/student', { replace: true });
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

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      window.location.assign('/login');
    }
  };

  if (profile.isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Loading...</div>;
  }
  // Already registered (for example the account was created by an administrator).
  if (profile.data?.studentCode) return <Navigate to="/student" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="text-center">
          <Logo className="mb-2 justify-center" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Complete your registration</h1>
          <p className="mt-2 text-sm text-gray-500">Add your student details so FAAPS can build your study plan.</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Signed in with Google</p>
          <p className="mt-1 font-semibold text-gray-900">{user?.fullName}</p>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-5">
          <div>
            <label htmlFor="studentCode" className="mb-1 block text-sm font-medium text-gray-700">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE173012" className={input} />
            {errors.studentCode && <p className="mt-1 text-xs text-red-500">{errors.studentCode.message}</p>}
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Date of birth <span className="text-red-500">*</span>
            </span>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => <DateOfBirthField value={field.value} onChange={field.onChange} idPrefix="complete-dob" />}
            />
            {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth.message}</p>}
          </div>

          <div>
            <label htmlFor="curriculumVersionId" className="mb-1 block text-sm font-medium text-gray-700">
              Curriculum <span className="text-red-500">*</span>
            </label>
            <select id="curriculumVersionId" {...register('curriculumVersionId')} className={input} disabled={curriculums.isLoading}>
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
            {errors.curriculumVersionId && <p className="mt-1 text-xs text-red-500">{errors.curriculumVersionId.message}</p>}
            {curriculums.isError && <p className="mt-1 text-xs text-red-500">Could not load the curriculums. Please reload the page.</p>}
            {!curriculums.isLoading && !curriculums.isError && grouped.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">No curriculum is open for registration yet. Please contact an administrator.</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input id="phone" {...register('phone')} placeholder="0901234567" className={input} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {errors.root?.message && (
            <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={save.isPending}
            className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:bg-orange-400"
          >
            {save.isPending ? 'Saving...' : 'Complete registration'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Not you?{' '}
          <button type="button" onClick={signOut} className="font-semibold text-orange-600 hover:text-orange-700">
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
