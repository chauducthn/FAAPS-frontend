import { z } from 'zod';
import {
  PHONE_ERROR_MESSAGE,
  PHONE_PATTERN,
  STUDENT_ID_ERROR_MESSAGE,
  STUDENT_ID_PATTERN,
  emailMatchesRole,
  emailRoleErrorMessage,
  hasAllowedEmailDomain,
} from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';

export const createUserSchema = z
  .object({
    role: z.enum(['STUDENT', 'ADVISOR']),
    fullName: z.string().trim().min(2, 'Full name is required').max(255, 'At most 255 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(255, 'At most 255 characters'),
    phone: z.string().trim(),
    studentCode: z.string().trim(),
    curriculumId: z.string(),
    enrollmentSemesterId: z.string(),
    expectedGraduationSemesterId: z.string(),
    currentSemester: z.string(),
    maxAdvisees: z.string(),
  })
  .superRefine((v, ctx) => {
    const fail = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });

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
      const max = Number(v.maxAdvisees);
      if (!Number.isInteger(max) || max < 1 || max > 500) fail('maxAdvisees', 'Enter a number from 1 to 500');
    }
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;

export const emptyCreateUserValues = (role: AdminUserRole): CreateUserValues => ({
  role,
  fullName: '',
  email: '',
  phone: '',
  studentCode: '',
  curriculumId: '',
  enrollmentSemesterId: '',
  expectedGraduationSemesterId: '',
  currentSemester: '',
  maxAdvisees: '',
});

const fieldBase =
  'h-9 w-full rounded-md border bg-white px-3 text-sm text-ink-primary placeholder:text-ink-subtle transition-colors ' +
  'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60';

export const userFieldClass = (invalid?: boolean) =>
  invalid
    ? `${fieldBase} border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-200`
    : `${fieldBase} border-line hover:border-ink-subtle/50 focus:border-brand focus:ring-brand/15`;

export const userLabelClass = 'mb-1.5 block text-[13px] font-medium text-ink-secondary';
