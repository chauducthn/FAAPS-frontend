import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { useAuthMutations } from '@/modules/auth/hooks/mutations/useAuthMutations';
import { authService } from '@/modules/auth/services/authService';
import { AuthAlert } from '../components/AuthAlert';
import { AuthField as Field } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { DateOfBirthField } from '../components/DateOfBirthField';
import { AuthDivider, GoogleAuthButton } from '../components/GoogleAuthButton';
import { authInputClass as inputClass, authPrimaryButtonClass, authTextLinkClass } from '../components/authFormStyles';
import { registerSchema, type RegisterInput, type RegisterValues } from '../validations/register.schema';

/** Registration page: clean, compact, unified single-page layout. */
export default function Register() {
  const { loginGoogle } = useAuthMutations();
  const { setUser } = useAuth();

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
        phone: values.phone,
      }),
    onSuccess: (user) => {
      // Registration is complete: the student goes to the Dashboard and chooses the major later, in the Profile page.
      setUser(user);
      window.location.assign('/student');
    },
    onError: (error) => setError('root', { message: apiErrorMessage(error) }),
  });

  return (
    <AuthLayout
      width="wide"
      photoSide="left"
      title="Create your student account"
      description="Set up your FAAPS profile in a minute."
      back={{ to: '/', label: 'Back to home' }}
      footer={
        <>
          Already have an account?{' '}
          <Link viewTransition to="/login" className={authTextLinkClass}>
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleAuthButton label="Sign up with Google" onClick={() => loginGoogle()} />

        <AuthDivider label="Or with email" />

        <form noValidate onSubmit={handleSubmit((values) => submit.mutate(values))} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-6">
            <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message} className="sm:col-span-3">
              <input id="fullName" {...register('fullName')} autoComplete="name" placeholder="Nguyen Van A" className={inputClass} />
            </Field>

            <Field label="Date of birth" required error={errors.dateOfBirth?.message} className="sm:col-span-3">
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DateOfBirthField value={field.value} onChange={field.onChange} idPrefix="register-dob" />
                )}
              />
            </Field>

            <Field label="Student ID" htmlFor="studentCode" required error={errors.studentCode?.message} className="sm:col-span-2">
              <input id="studentCode" {...register('studentCode')} maxLength={8} placeholder="SE173012" className={inputClass} />
            </Field>

            <Field label="Email" htmlFor="email" required error={errors.email?.message} className="sm:col-span-2">
              <input
                id="email"
                type="email"
                {...register('email')}
                autoComplete="email"
                placeholder="name@fpt.edu.vn"
                className={inputClass}
              />
            </Field>

            <Field label="Phone" htmlFor="phone" required error={errors.phone?.message} className="sm:col-span-2">
              <input
                id="phone"
                {...register('phone')}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="0901234567"
                className={inputClass}
              />
            </Field>

            <Field label="Password" htmlFor="password" required error={errors.password?.message} className="sm:col-span-3">
              <input
                id="password"
                type="password"
                {...register('password')}
                autoComplete="new-password"
                placeholder="Min 8 chars"
                className={inputClass}
              />
            </Field>

            <Field
              label="Confirm password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword?.message}
              className="sm:col-span-3"
            >
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={inputClass}
              />
            </Field>
          </div>

          <p className="-mt-1 text-xs leading-relaxed text-ink-subtle">
            Password: at least 8 characters with an uppercase letter, a lowercase letter, a digit and a special character,
            and it must not contain your Student ID, name or email. After signing in you can choose your major in your
            Profile.
          </p>

          {errors.root?.message && (
            <AuthAlert tone="error" role="alert">
              {errors.root.message}
            </AuthAlert>
          )}

          <button type="submit" disabled={submit.isPending} className={authPrimaryButtonClass}>
            {submit.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
