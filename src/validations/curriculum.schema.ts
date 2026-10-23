// src/validations/curriculum.schema.ts
import { z } from 'zod';

const id = (message: string) =>
  z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, message);

export const curriculumFormSchema = z.object({
  majorId: id('Select a major'),
  version: z.string().trim().min(1, 'Cohort / version is required (e.g. K19)').max(50, 'At most 50 characters'),
  name: z.string().trim().min(2, 'Name is required').max(255, 'At most 255 characters'),
  effectiveFromSemesterId: id('Select the first semester'),
  effectiveToSemesterId: z.string().optional(),
  description: z.string().max(2000, 'At most 2000 characters').optional(),
  isCurrent: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CurriculumFormValues = z.infer<typeof curriculumFormSchema>;
