// Create or edit a Student / Advisor account from the admin User Accounts page.
//
// The form is the only place where an account's identity is typed, so it owns
// the validation rules: the identifier formats, the mail domain each role
// must use, and the academic fields that follow from the Student ID.
//
// Accounts are created for Google sign-in, so the form explains that instead
// of asking for a password. The admin can still issue a temporary password
// later with "Reset password" on the account row.

import { useEffect, useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, GraduationCap, Info, Loader2, Sparkles, UserRound, X } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery, useSemesterOptions } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { adminService } from '../services/adminService';
import {
  ADVISOR_CODE_ERROR_MESSAGE,
  ADVISOR_CODE_PATTERN,
  PHONE_ERROR_MESSAGE,
  PHONE_PATTERN,
  STUDENT_ID_ERROR_MESSAGE,
  STUDENT_ID_PATTERN,
  emailDomainErrorMessage,
  emailMatchesRole,
  emailRoleErrorMessage,
  hasAllowedEmailDomain,
  isAfterSemester,
  parseStudentId,
  sortSemesters,
  suggestGraduationSemester,
} from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';

const createUserSchema = z
  .object({
    role: z.enum(['STUDENT', 'ADVISOR']),
    fullName: z.string().trim().min(2, 'Full name is required').max(255, 'At most 255 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(255, 'At most 255 characters'),
    phone: z.string().trim(),
    studentCode: z.string().trim(),
    advisorCode: z.string().trim(),
    curriculumId: z.string(),
    enrollmentSemesterId: z.string(),
    expectedGraduationSemesterId: z.string(),
    currentSemester: z.string(),
    maxAdvisees: z.string(),
  })
  .superRefine((v, ctx) => {
    const fail = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });

    // The mail domain has to match the role, otherwise the account can never
    // sign in the way the role requires.
    if (v.email && hasAllowedEmailDomain(v.email) && !emailMatchesRole(v.email, v.role)) {
      fail('email', emailRoleErrorMessage(v.role));
    }

    if (v.phone && !PHONE_PATTERN.test(v.phone)) {
      fail('phone', PHONE_ERROR_MESSAGE);
    }

    if (v.role === 'STUDENT') {
      if (!STUDENT_ID_PATTERN.test(v.studentCode.toUpperCase())) fail('studentCode', STUDENT_ID_ERROR_MESSAGE);
      if (!v.curriculumId) fail('curriculumId', 'Select a curriculum');
      if (!v.enrollmentSemesterId) fail('enrollmentSemesterId', 'Select the enrollment semester');
      const semester = Number(v.currentSemester);
      if (!Number.isInteger(semester) || semester < 1 || semester > 9) fail('currentSemester', 'Enter a number from 1 to 9');
    } else {
      if (!ADVISOR_CODE_PATTERN.test(v.advisorCode.toUpperCase())) fail('advisorCode', ADVISOR_CODE_ERROR_MESSAGE);
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
  advisorCode: '',
  curriculumId: '',
  enrollmentSemesterId: '',
  expectedGraduationSemesterId: '',
  currentSemester: '1',
  maxAdvisees: '30',
});

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

interface Props {
  open: boolean;
  defaultRole: AdminUserRole;
  /** The account being edited. Omit it to create a new one. */
  user?: AdminUserSummary | null;
  onClose: () => void;
  onCreated: (name: string) => void;
}

export function CreateUserModal({ open, defaultRole, user, onClose, onCreated }: Props) {
  const isEdit = !!user;
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const semesters = useSemesterOptions(open);
  const majors = useMajorOptions();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema), defaultValues: emptyValues(defaultRole) });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({
        ...emptyValues(user.role),
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        studentCode: user.role === 'STUDENT' ? user.userId : '',
        advisorCode: user.role === 'ADVISOR' ? user.userId : '',
      });
      return;
    }
    reset(emptyValues(defaultRole));
  }, [open, defaultRole, user, reset]);

  const role = watch('role');
  const studentCode = watch('studentCode');
  const advisorCode = watch('advisorCode');
  const email = watch('email');
  const curriculumId = watch('curriculumId');
  const enrollmentSemesterId = watch('enrollmentSemesterId');
  const expectedGraduationSemesterId = watch('expectedGraduationSemesterId');

  const curriculumList = useMemo(() => curriculums.data?.items ?? [], [curriculums.data]);
  const semesterList = useMemo(() => sortSemesters(semesters.data ?? []), [semesters.data]);
  const majorList = majors.data ?? [];

  /**
   * The Student ID carries the academic identity: the first two letters are
   * the major, the next two digits are the admission year (17 → K17).
   */
  const identity = useMemo(() => parseStudentId(studentCode), [studentCode]);
  const major = identity ? majorList.find((m) => m.code === identity.majorCode) : undefined;

  /**
   * Auto-fill: the ID picks the curriculum of that major and cohort, and the
   * curriculum picks the semester the student starts in.
   */
  useEffect(() => {
    if (role !== 'STUDENT' || !identity) return;
    const match = curriculumList.find(
      (c) => c.majorCode === identity.majorCode && c.version === identity.cohort,
    );
    if (!match) {
      setValue('curriculumId', '', { shouldValidate: true });
      return;
    }
    setValue('curriculumId', match.id, { shouldValidate: true });
    setValue('enrollmentSemesterId', match.effectiveFromSemesterId, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.code, role, curriculumList]);

  /**
   * The graduation semester follows the enrollment semester by the length of
   * the programme. It is only a suggestion: the admin can pick another one.
   *
   * The semester catalogue may still be loading when the ID is typed, so the
   * catalogue is part of the dependency: the suggestion is made as soon as
   * the semesters are known.
   */
  useEffect(() => {
    if (role !== 'STUDENT' || !enrollmentSemesterId) return;
    const suggestion = suggestGraduationSemester(semesterList, enrollmentSemesterId);
    if (!suggestion) return;
    setValue('expectedGraduationSemesterId', suggestion.id, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentSemesterId, role, semesterList]);

  /** The graduation semester must come after the enrollment semester. */
  const enrolled = semesterList.find((s) => s.id === enrollmentSemesterId);
  const graduating = semesterList.find((s) => s.id === expectedGraduationSemesterId);
  const graduationConflict = !isAfterSemester(graduating, enrolled);
  const graduationOptions = useMemo(() => {
    const enrolledStart = enrolled?.startDate;
    if (!enrolledStart) return semesterList;
    return semesterList.filter((s) => !s.startDate || s.startDate > enrolledStart);
  }, [semesterList, enrolled]);

  /** The role and the mail domain have to agree before the form can be sent. */
  const emailRoleConflict =
    email.trim().length > 0 &&
    hasAllowedEmailDomain(email) &&
    !emailMatchesRole(email, role);

  const submit = handleSubmit(async (v) => {
    const isStudent = v.role === 'STUDENT';

    if (isStudent && graduationConflict) {
      setError('expectedGraduationSemesterId', {
        message: 'The graduation semester must come after the enrollment semester',
      });
      return;
    }

    try {
      if (isEdit && user) {
        await adminService.changeUserRole(user.id, {
          role: v.role,
          studentCode: isStudent ? v.studentCode.toUpperCase() : undefined,
        });
      } else {
        await adminService.createUser({
          role: v.role,
          email: v.email.trim(),
          fullName: v.fullName.trim(),
          phone: v.phone || undefined,
          ...(isStudent
            ? {
                studentCode: v.studentCode.toUpperCase(),
                curriculumVersionId: v.curriculumId,
                enrollmentSemesterId: v.enrollmentSemesterId,
                expectedGraduationSemesterId: v.expectedGraduationSemesterId || undefined,
                currentSemester: Number(v.currentSemester),
              }
            : {
                advisorCode: v.advisorCode.toUpperCase(),
                maxAdvisees: Number(v.maxAdvisees),
              }),
        });
      }
      onCreated(v.fullName.trim());
    } catch (error) {
      setError('root', { message: apiErrorMessage(error) });
    }
  });

  const changeRole = (next: AdminUserRole) => {
    setValue('role', next, { shouldValidate: true });
    // The identifiers belong to one role each, so they are cleared on a switch.
    if (next === 'STUDENT') {
      setValue('advisorCode', '');
    } else {
      setValue('studentCode', '');
      setValue('curriculumId', '');
      setValue('enrollmentSemesterId', '');
      setValue('expectedGraduationSemesterId', '');
    }
    clearErrors(['studentCode', 'advisorCode', 'curriculumId', 'enrollmentSemesterId', 'expectedGraduationSemesterId']);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit user' : 'Create user'} className="max-w-2xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              {role === 'STUDENT' ? <GraduationCap className="size-5" /> : <UserRound className="size-5" />}
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-gray-900">
                {isEdit ? 'Edit user' : 'Create user'}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {isEdit
                  ? 'Change the role or the details of this account. The role decides which mail domain the address must use.'
                  : 'Add a Student or an Advisor account to FAAPS.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5 text-[13px]">
          <div role="note" className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-blue-900">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p className="text-[12px] leading-relaxed">
              <strong>No password is set at creation.</strong> Accounts sign in with Google, so the person must use exactly
              the email entered below. A temporary password can be issued later with <strong>Reset password</strong> on the
              account row.
            </p>
          </div>

          <Section title="Account" hint="The identity of the person and the role they hold.">
            <Field label="Role" required>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="Role">
                {(['STUDENT', 'ADVISOR'] as const).map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-bold transition-all',
                      role === r
                        ? 'bg-white text-[#C2410C] shadow-xs ring-1 ring-orange-200'
                        : 'text-gray-400 hover:text-gray-600',
                    )}
                  >
                    <input
                      type="radio"
                      value={r}
                      checked={role === r}
                      onChange={() => changeRole(r)}
                      className="sr-only"
                    />
                    {r === 'STUDENT' ? 'Student' : 'Advisor'}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName?.message}>
                <input {...register('fullName')} placeholder="Nguyen Van A" className={field} aria-label="Full name" />
              </Field>
              <Field
                label="Email"
                required
                error={errors.email?.message}
                hint={role === 'STUDENT' ? 'Must be an @fpt.edu.vn address' : 'Must be an @fe.edu.vn address'}
              >
                <input
                  type="email"
                  {...register('email')}
                  placeholder={role === 'STUDENT' ? 'name@fpt.edu.vn' : 'name@fe.edu.vn'}
                  className={cn(field, emailRoleConflict && 'border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-200')}
                  aria-label="Email"
                />
              </Field>
            </div>

            {emailRoleConflict && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-red-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {emailRoleErrorMessage(role)}
              </p>
            )}

            <Field label="Phone" error={errors.phone?.message} hint="Optional. A Vietnamese mobile number, for example 0901234567.">
              <input {...register('phone')} placeholder="0901234567" className={field} aria-label="Phone" />
            </Field>
          </Section>

          {role === 'STUDENT' ? (
            <Section title="Student profile" hint="The Student ID carries the major and the cohort.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Student ID" required error={errors.studentCode?.message} hint="Two letters for the major, then six digits.">
                  <input
                    {...register('studentCode', { setValueAs: (v: string) => v.toUpperCase() })}
                    maxLength={8}
                    placeholder="SE173012"
                    className={cn(field, 'font-mono font-bold uppercase')}
                    aria-label="Student ID"
                  />
                </Field>
                <Field label="Curriculum" required error={errors.curriculumId?.message} hint="The major and cohort the student follows.">
                  <select {...register('curriculumId')} className={field} aria-label="Curriculum">
                    <option value="">Select a curriculum…</option>
                    {curriculumList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.majorCode} {c.version} — {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">Derived from the ID</span>
                {identity ? (
                  <>
                    <DerivedChip icon={<GraduationCap className="size-3" />} label={`Major ${major?.name ?? identity.majorCode}`} />
                    <DerivedChip icon={<Sparkles className="size-3" />} label={`Cohort ${identity.cohort}`} />
                    {!major && <DerivedChip tone="warn" label="No matching major" />}
                  </>
                ) : (
                  <span className="text-[11px] text-gray-400">Enter a Student ID to resolve the major and cohort.</span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Enrollment semester" required error={errors.enrollmentSemesterId?.message}>
                  <select {...register('enrollmentSemesterId')} className={field} aria-label="Enrollment semester">
                    <option value="">Select…</option>
                    {semesterList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Current semester" required error={errors.currentSemester?.message} hint="From 1 to 9.">
                  <input type="number" min={1} max={9} {...register('currentSemester')} className={field} aria-label="Current semester" />
                </Field>
                <Field
                  label="Expected graduation"
                  error={errors.expectedGraduationSemesterId?.message}
                  hint="Suggested from the enrollment semester."
                >
                  <select
                    {...register('expectedGraduationSemesterId')}
                    className={cn(field, graduationConflict && 'border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-200')}
                    aria-label="Expected graduation semester"
                  >
                    <option value="">Not set</option>
                    {graduationOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {graduationConflict && (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-red-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  The graduation semester must come after the enrollment semester.
                </p>
              )}
            </Section>
          ) : (
            <Section title="Advisor profile" hint="The Advisor Code and how many students can be assigned.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Advisor Code" required error={errors.advisorCode?.message} hint="ADV followed by three digits.">
                  <input
                    {...register('advisorCode', { setValueAs: (v: string) => v.toUpperCase() })}
                    maxLength={6}
                    placeholder="ADV001"
                    className={cn(field, 'font-mono font-bold uppercase')}
                    aria-label="Advisor Code"
                  />
                </Field>
                <Field label="Maximum advisees" required error={errors.maxAdvisees?.message} hint="How many students this advisor can take at the same time.">
                  <input type="number" min={1} max={500} {...register('maxAdvisees')} className={field} aria-label="Maximum advisees" />
                </Field>
              </div>
            </Section>
          )}

          {errors.root?.message && (
            <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700">
              {errors.root.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || emailRoleConflict || graduationConflict}
            title={emailRoleConflict || graduationConflict ? 'Fix the highlighted field to continue' : undefined}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function DerivedChip({ icon, label, tone = 'default' }: { icon?: ReactNode; label: string; tone?: 'default' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
        tone === 'warn'
          ? 'bg-red-50 text-red-700 ring-red-200'
          : 'bg-orange-50 text-[#9a3412] ring-orange-200',
      )}
    >
      {icon}
      {label}
    </span>
  );
}
