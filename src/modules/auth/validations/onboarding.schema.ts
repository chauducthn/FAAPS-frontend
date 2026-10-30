import { z } from 'zod';
import { dateOfBirthSchema, phoneSchema, studentCodeSchema } from './register.schema';

export const completeRegistrationSchema = z.object({
  studentCode: studentCodeSchema,
  dateOfBirth: dateOfBirthSchema,
  curriculumVersionId: z.string().min(1, 'Select your curriculum'),
  phone: phoneSchema,
});

export type CompleteRegistrationInput = z.input<typeof completeRegistrationSchema>;
export type CompleteRegistrationValues = z.output<typeof completeRegistrationSchema>;
