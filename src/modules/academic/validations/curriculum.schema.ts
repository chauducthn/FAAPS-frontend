// src/validations/curriculum.schema.ts
import { z } from 'zod';

const id = (message: string) =>
  // Accept both backend UUIDs and mock ids (major-se, sem-fa2022, cv-0001, ...).
  z.string().trim().min(1, message);

export const curriculumFormSchema = z.object({
  majorId: id('Select a major'),
  version: z
    .string()
    .trim()
    .regex(/^K(0[1-9]|[1-9]\d)$/i, 'Must be K followed by 01–99 (e.g. K19)'),
  name: z.string().trim().min(2, 'Name is required').max(255, 'At most 255 characters'),
  effectiveFromSemesterId: id('Select the first semester'),
  effectiveToSemesterId: id('Select the end semester'),
  description: z.string().max(2000, 'At most 2000 characters').optional(),
  isCurrent: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CurriculumFormValues = z.infer<typeof curriculumFormSchema>;
