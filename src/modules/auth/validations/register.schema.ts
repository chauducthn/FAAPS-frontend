import { z } from 'zod';

const isRealDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

export const studentCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{2}\d{6}$/, 'Use two letters and six digits, for example SE173012'));

export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select your day, month and year of birth')
  .refine(isRealDate, 'This date does not exist')
  .refine((value) => new Date(value) < new Date(), 'Date of birth must be in the past');

export const phoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\+?[0-9 .()-]{8,20}$/.test(value), 'Enter a valid phone number');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(255, 'At most 255 characters'),
    studentCode: studentCodeSchema,
    dateOfBirth: dateOfBirthSchema,
    email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address').max(255, 'At most 255 characters'),
    phone: phoneSchema,
    curriculumVersionId: z.string().min(1, 'Select your curriculum'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(72, 'Use at most 72 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/\d/, 'Include a digit'),
    confirmPassword: z.string().min(1, 'Repeat your password'),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
