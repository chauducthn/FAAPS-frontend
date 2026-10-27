// src/validations/advising.schema.ts
import { z } from 'zod';

export const REQUEST_TYPES = [
  'PLAN_REVIEW',
  'COURSE_SELECTION',
  'ACADEMIC_GUIDANCE',
  'GRADUATION_CHECK',
  'OTHER',
] as const;

export const createAdvisingRequestSchema = z.object({
  requestType: z.enum(REQUEST_TYPES, { message: 'Select a request type' }),
  title: z.string().trim().min(5, 'Title must contain at least 5 characters').max(255, 'Maximum 255 characters'),
  description: z.string().trim().max(2000, 'Maximum 2000 characters').optional(),
  studyPlanId: z.string().uuid('Invalid study plan ID').optional().or(z.literal('')),
});

export type CreateAdvisingRequestFormValues = z.infer<typeof createAdvisingRequestSchema>;
