import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Logo } from '@/shared/components/common/Logo';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { authService } from '@/modules/auth/services/authService';
import type { AcademicStudentProfile } from '@/modules/academic/services/studentAcademicService';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { matchCurriculums } from '../lib/curriculumMatch';
import { clearPendingStudentCode, readPendingStudentCode } from '../lib/pendingStudentCode';
import { onboardingService } from '../services/onboardingService';
import { ONBOARDING_KEYS, useCurriculumChoices, useRegistrationProfile } from '../hooks/queries/useStudentOnboarding';
import {
  completeRegistrationSchema,
  type CompleteRegistrationInput,
  type CompleteRegistrationValues,
} from '../validations/onboarding.schema';

const input =
  'block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

/**
 * Step 2 of registration: choose the major / curriculum. Used after a manual sign-up (the Student ID is already
 * known) and after the first Google sign-in (the student also gives the Student ID, birth date and phone here).
 * Only the curriculums that fit the Student ID are offered.
 */
function RegistrationForm({ profile }: { profile: AcademicStudentProfile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const curriculums = useCurriculumChoices();

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CompleteRegistrationInput, unknown, CompleteRegistrationValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      studentCode: readPendingStudentCode(),
      dateOfBirth: profile.dateOfBirth ?? '',
      curriculumVersionId: '',
      phone: profile.phone ?? '',
    },
  });

  const studentCode = useWatch({ control, name: 'studentCode' }) ?? '';
  const match = useMemo(
    () => matchCurriculums(studentCode, curriculums.data ?? []),
    [studentCode, curriculums.data],
  );

  // The Student ID decides which curriculums are offered: drop a choice that no longer fits and pick the cohort's own.
  useEffect(() => {
    const current = getValues('curriculumVersionId');
    const stillOffered = match.options.some((item) => item.id === current);
    if (!stillOffered) setValue('curriculumVersionId', match.preferredId ?? '');
  }, [match, getValues, setValue]);

  const save = useMutation({
    mutationFn: (values: CompleteRegistrationValues) =>
      onboardingService.complete({
        studentCode: values.studentCode,
        curriculumVersionId: values.curriculumVersionId,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
      }),
    onSuccess: (saved) => {
      clearPendingStudentCode();
      queryClient.setQueryData(ONBOARDING_KEYS.profile, saved);
      toast.success('Registration complete. Welcome to FAAPS!');
      navigate('/student', { replace: true });
    },
    onError: (error) => setError('root', { message: apiErrorMessage(error) }),
  });

  const grouped = useMemo(() => {
    const byMajor = new Map<string, { label: string; items: typeof match.options }>();
    for (const item of match.options) {
      const entry = byMajor.get(item.majorCode) ?? { label: `${item.majorCode} - ${item.majorName}`, items: [] };
      entry.items.push(item);
      byMajor.set(item.majorCode, entry);
    }
    return [...byMajor.values()];
  }, [match]);

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      clearPendingStudentCode();
      logout();
      window.location.assign('/login');
    }
  };

  const hasStudentCode = studentCode.trim().length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="text-center">
          <Logo className="mb-2 justify-center" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Choose your major</h1>
          <p className="mt-2 text-sm text-gray-500">One last step so FAAPS can build your study plan.</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Signed in as</p>
          <p className="mt-1 font-semibold text-gray-900">{user?.fullName}</p>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-5">
          <div>
            <label htmlFor="studentCode" className="mb-1 block text-sm font-medium text-gray-700">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE190001" className={input} />
            {errors.studentCode && <p className="mt-1 text-xs text-red-500">{errors.studentCode.message}</p>}
          </div>

          <div>
            <label htmlFor="curriculumVersionId" className="mb-1 block text-sm font-medium text-gray-700">
              Major / Curriculum <span className="text-red-500">*</span>
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
            {!curriculums.isLoading && !curriculums.isError && hasStudentCode && (
              <p className="mt-1 text-xs text-gray-500">
                {match.matched
                  ? `Showing the curriculums that fit your Student ID (${studentCode.trim().toUpperCase().slice(0, 2)}).`
                  : 'No major matches this Student ID yet, so all curriculums are shown.'}
              </p>
            )}
            {!curriculums.isLoading && !curriculums.isError && grouped.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">No curriculum is open for registration yet. Please contact an administrator.</p>
            )}
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
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input id="phone" {...register('phone')} inputMode="numeric" maxLength={10} placeholder="0901234567" className={input} />
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

export default function CompleteRegistration() {
  const profile = useRegistrationProfile();

  if (profile.isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Loading...</div>;
  }
  // Already registered (for example the account was created by an administrator).
  if (profile.data?.studentCode) return <Navigate to="/student" replace />;
  if (!profile.data) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Could not load your account. Please reload the page.</div>;
  }

  return <RegistrationForm profile={profile.data} />;
}
