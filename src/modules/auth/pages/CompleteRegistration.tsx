import { Navigate, useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { authService } from '@/modules/auth/services/authService';
import type { AcademicStudentProfile } from '@/modules/academic/services/studentAcademicService';
import { AuthAlert } from '../components/AuthAlert';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthStatusScreen } from '../components/AuthStatusScreen';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { authInputClass as input, authPrimaryButtonClass, authTextLinkClass } from '../components/authFormStyles';
import { onboardingService } from '../services/onboardingService';
import { ONBOARDING_KEYS, useRegistrationProfile } from '../hooks/queries/useStudentOnboarding';
import {
  completeRegistrationSchema,
  type CompleteRegistrationInput,
  type CompleteRegistrationValues,
} from '../validations/onboarding.schema';

/**
 * Second step for a student who signed in with Google for the first time: the Student ID, birth date and phone.
 * The major and curriculum are not asked here; the student chooses them later in the Profile page.
 */
function RegistrationForm({ profile }: { profile: AcademicStudentProfile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CompleteRegistrationInput, unknown, CompleteRegistrationValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: { studentCode: '', dateOfBirth: profile.dateOfBirth ?? '', phone: profile.phone ?? '' },
  });

  const save = useMutation({
    mutationFn: (values: CompleteRegistrationValues) =>
      onboardingService.complete({
        studentCode: values.studentCode,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(ONBOARDING_KEYS.profile, saved);
      toast.success('Registration complete. Welcome to FAAPS!');
      navigate('/student', { replace: true });
    },
    onError: (error) => setError('root', { message: apiErrorMessage(error) }),
  });

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      window.location.assign('/login');
    }
  };

  return (
    <AuthLayout
      title="Complete your registration"
      description="Add your student details. You can choose your major in your Profile after signing in."
      footer={
        <>
          Not you?{' '}
          <button type="button" onClick={signOut} className={authTextLinkClass}>
            Sign out
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-md border border-line bg-surface-page px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-semibold text-white">
            {user?.fullName?.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <div className="min-w-0 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">Signed in as</p>
            <p className="truncate font-semibold text-ink-primary">{user?.fullName}</p>
            <p className="truncate text-ink-muted">{user?.email}</p>
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-5">
          <AuthField label="Student ID" htmlFor="studentCode" required error={errors.studentCode?.message}>
            <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE190001" className={input} />
          </AuthField>

          <AuthField label="Date of birth" required error={errors.dateOfBirth?.message}>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <DateOfBirthField value={field.value} onChange={field.onChange} idPrefix="complete-dob" />
              )}
            />
          </AuthField>

          <AuthField label="Phone" htmlFor="phone" required error={errors.phone?.message}>
            <input
              id="phone"
              {...register('phone')}
              inputMode="numeric"
              maxLength={10}
              placeholder="0901234567"
              className={input}
            />
          </AuthField>

          {errors.root?.message && (
            <AuthAlert tone="error" role="alert">
              {errors.root.message}
            </AuthAlert>
          )}

          <button type="submit" disabled={save.isPending} className={authPrimaryButtonClass}>
            {save.isPending ? 'Saving...' : 'Complete registration'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function CompleteRegistration() {
  const profile = useRegistrationProfile();

  if (profile.isLoading) {
    return <AuthStatusScreen message="Loading..." busy />;
  }
  // Already registered (for example the account was created by an administrator).
  if (profile.data?.studentCode) return <Navigate to="/student" replace />;
  if (!profile.data) {
    return <AuthStatusScreen message="Could not load your account. Please reload the page." />;
  }

  return <RegistrationForm profile={profile.data} />;
}
