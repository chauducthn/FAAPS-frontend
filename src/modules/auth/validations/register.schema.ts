import { z } from 'zod';

/** Youngest age at which someone can be a university student here. Keep in sync with the backend. */
export const MIN_STUDENT_AGE = 17;

/** Two letters (major), cohort 01-22, then four digits: SE190001. Keep in sync with the backend. */
export const STUDENT_CODE_PATTERN = /^[A-Z]{2}(0[1-9]|1\d|2[0-2])\d{4}$/;
export const STUDENT_CODE_MESSAGE = 'Use 2 letters, a cohort from 01 to 22 and 4 digits, for example SE190001';

/** Vietnamese mobile number: a leading 0, then 3/5/7/8/9, then 8 digits. No country code or spaces. */
export const PHONE_PATTERN = /^0[35789]\d{8}$/;
export const PHONE_MESSAGE = 'Enter a 10-digit Vietnamese number starting with 0, for example 0901234567';

const isRealDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const isOldEnough = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - MIN_STUDENT_AGE);
  return new Date(y, m - 1, d) <= limit;
};

export const studentCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(STUDENT_CODE_PATTERN, STUDENT_CODE_MESSAGE));

export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select your day, month and year of birth')
  .refine(isRealDate, 'This date does not exist')
  .refine((value) => new Date(value) < new Date(), 'Date of birth must be in the past')
  .refine(isOldEnough, `You must be at least ${MIN_STUDENT_AGE} years old`);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter your phone number')
  .regex(PHONE_PATTERN, PHONE_MESSAGE);

/** For screens where a phone number may be left empty but, when given, must be a valid one. */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || PHONE_PATTERN.test(value), PHONE_MESSAGE);

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a digit')
  .regex(/[^A-Za-z0-9]/, 'Include a special character, for example @ # $ !');

const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();

/** True when the password contains the Student ID, a word of the name, or the part of the email before "@". */
export function passwordContainsPersonalInfo(
  password: string,
  person: { studentCode: string; fullName: string; email: string },
): boolean {
  const target = fold(password);
  const code = fold(person.studentCode.trim());
  const name = fold(person.fullName.trim());
  const emailName = fold(person.email.trim().split('@')[0] ?? '');
  const parts = [
    code,
    code.slice(2),
    name.replace(/\s+/g, ''),
    ...name.split(/\s+/),
    emailName,
  ].filter((part) => part.length >= (part === code.slice(2) ? 6 : 3));
  return parts.some((part) => target.includes(part));
}

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(255, 'At most 255 characters'),
    studentCode: studentCodeSchema,
    dateOfBirth: dateOfBirthSchema,
    email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address').max(255, 'At most 255 characters'),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Repeat your password'),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => !passwordContainsPersonalInfo(v.password, v), {
    path: ['password'],
    message: 'Password must not contain your Student ID, name or email',
  });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
