// Create a Student or Advisor account from the admin User Accounts page.
// The backend creates every account for Google sign-in (there is no password field), so the form explains that
// instead of asking for one.
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, X } from 'lucide-react';
import { z } from 'zod';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery, useSemesterOptions } from '../../academic/hooks/queries/useCurriculumsQuery';
import { adminService } from '../services/adminService';
import type { AdminUserRole } from '../types/admin';

const STUDENT_CODE = /^(SE|IA)1\d{5}$/;
const PHONE = /^\+?[0-9 .()-]{8,20}$/;

const createUserSchema = z
  .object({
    role: z.enum(['STUDENT', 'ADVISOR']),
    fullName: z.string().trim().min(2, 'Full name is required').max(255, 'At most 255 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(255, 'At most 255 characters'),
    phone: z.string().trim().refine((v) => v === '' || PHONE.test(v), 'Enter a valid phone number'),
    studentCode: z.string().trim(),
    curriculumId: z.string(),
    enrollmentSemesterId: z.string(),
    expectedGraduationSemesterId: z.string(),
    currentSemester: z.string(),
    maxAdvisees: z.string(),
  })
  .superRefine((v, ctx) => {
    const fail = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (v.role === 'STUDENT') {
      if (!STUDENT_CODE.test(v.studentCode)) fail('studentCode', 'Use the format SE173012 or IA173012');
      if (!v.curriculumId) fail('curriculumId', 'Select a curriculum');
      if (!v.enrollmentSemesterId) fail('enrollmentSemesterId', 'Select the enrollment semester');
      const semester = Number(v.currentSemester);
      if (!Number.isInteger(semester) || semester < 1 || semester > 12) fail('currentSemester', 'Enter a number from 1 to 12');
    } else {
      const max = Number(v.maxAdvisees);
      if (!Number.isInteger(max) || max < 1 || max > 500) fail('maxAdvisees', 'Enter a number from 1 to 500');
    }
  });

type CreateUserValues = z.infer<typeof createUserSchema>;

const emptyValues = (role: AdminUserRole): CreateUserValues => ({
  role,
  fullName: '',
  email: '',
  phone: '',
  studentCode: '',
  curriculumId: '',
  enrollmentSemesterId: '',
  expectedGraduationSemesterId: '',
  currentSemester: '1',
  maxAdvisees: '30',
});

const field =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-[#F26F21] focus:outline-none disabled:bg-gray-50';

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-bold uppercase text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  defaultRole: AdminUserRole;
  onClose: () => void;
  onCreated: (name: string) => void;
}

export function CreateUserModal({ open, defaultRole, onClose, onCreated }: Props) {
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const semesters = useSemesterOptions(open);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema), defaultValues: emptyValues(defaultRole) });

  useEffect(() => {
    if (open) reset(emptyValues(defaultRole));
  }, [open, defaultRole, reset]);

  const role = watch('role');
  const curriculumId = watch('curriculumId');
  const curriculumList = curriculums.data?.items ?? [];
  const semesterList = semesters.data ?? [];

  // The cohort usually starts in its first semester, so offer that as the starting point.
  useEffect(() => {
    const chosen = curriculumList.find((c) => c.id === curriculumId);
    if (chosen) setValue('enrollmentSemesterId', chosen.effectiveFromSemesterId, { shouldValidate: true });
  }, [curriculumId, curriculumList, setValue]);

  const submit = handleSubmit(async (v) => {
    const isStudent = v.role === 'STUDENT';
    if (isStudent && v.expectedGraduationSemesterId) {
      const enrolled = semesterList.find((s) => s.id === v.enrollmentSemesterId);
      const graduating = semesterList.find((s) => s.id === v.expectedGraduationSemesterId);
      if (enrolled?.startDate && graduating?.startDate && graduating.startDate < enrolled.startDate) {
        setError('expectedGraduationSemesterId', { message: 'Cannot be before the enrollment semester' });
        return;
      }
    }
    try {
      await adminService.createUser({
        role: v.role,
        email: v.email.trim(),
        fullName: v.fullName.trim(),
        phone: v.phone || undefined,
        ...(isStudent
          ? {
              studentCode: v.studentCode,
              curriculumVersionId: v.curriculumId,
              enrollmentSemesterId: v.enrollmentSemesterId,
              expectedGraduationSemesterId: v.expectedGraduationSemesterId || undefined,
              currentSemester: Number(v.currentSemester),
            }
          : { maxAdvisees: Number(v.maxAdvisees) }),
      });
      onCreated(v.fullName.trim());
    } catch (error) {
      setError('root', { message: apiErrorMessage(error) });
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Create user" className="max-w-2xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col text-xs">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create user</h2>
            <p className="mt-0.5 text-gray-500">Add a Student or an Advisor account.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div role="note" className="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-blue-900">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>No password is set.</strong> Accounts sign in with Google, so the person must use exactly the email
              entered below. Tell them to choose “Sign in with Google” on the login page.
            </p>
          </div>

          <Field label="Role" required>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Role">
              {(['STUDENT', 'ADVISOR'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 font-semibold ${
                    role === r ? 'border-[#F26F21] bg-orange-50 text-[#F26F21]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" value={r} {...register('role')} className="sr-only" />
                  {r === 'STUDENT' ? 'Student' : 'Advisor'}
                </label>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.fullName?.message}>
              <input {...register('fullName')} placeholder="Nguyen Van A" className={field} aria-label="Full name" />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <input type="email" {...register('email')} placeholder="name@fpt.edu.vn" className={field} aria-label="Email" />
            </Field>
          </div>

          <Field label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="0901234567" className={field} aria-label="Phone" />
          </Field>

          {role === 'STUDENT' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Student ID" required error={errors.studentCode?.message}>
                  <input
                    {...register('studentCode', { setValueAs: (v: string) => v.toUpperCase() })}
                    maxLength={8}
                    placeholder="SE173012"
                    className={field}
                    aria-label="Student ID"
                  />
                </Field>
                <Field label="Curriculum" required error={errors.curriculumId?.message} hint="The major and cohort the student follows.">
                  <select {...register('curriculumId')} className={field} aria-label="Curriculum">
                    <option value="">Select a curriculum...</option>
                    {curriculumList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.majorCode} {c.version} - {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Enrollment semester" required error={errors.enrollmentSemesterId?.message}>
                  <select {...register('enrollmentSemesterId')} className={field} aria-label="Enrollment semester">
                    <option value="">Select...</option>
                    {semesterList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Expected graduation" error={errors.expectedGraduationSemesterId?.message}>
                  <select {...register('expectedGraduationSemesterId')} className={field} aria-label="Expected graduation semester">
                    <option value="">Not set</option>
                    {semesterList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Current semester" required error={errors.currentSemester?.message}>
                  <input type="number" {...register('currentSemester')} className={field} aria-label="Current semester" />
                </Field>
              </div>
            </>
          ) : (
            <Field label="Maximum advisees" required error={errors.maxAdvisees?.message} hint="How many students this advisor can take at the same time.">
              <input type="number" {...register('maxAdvisees')} className={field} aria-label="Maximum advisees" />
            </Field>
          )}

          {errors.root?.message && (
            <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-700">
              {errors.root.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#F26F21] px-4 py-2 font-bold text-white hover:bg-[#e05f14] disabled:opacity-60">
            {isSubmitting ? 'Creating...' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
