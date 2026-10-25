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
  requestType: z.enum(REQUEST_TYPES, { message: 'Chọn loại yêu cầu' }),
  title: z.string().trim().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(255, 'Tối đa 255 ký tự'),
  description: z.string().trim().max(2000, 'Tối đa 2000 ký tự').optional(),
  studyPlanId: z.string().uuid('Mã kế hoạch học tập không hợp lệ').optional().or(z.literal('')),
});

export type CreateAdvisingRequestFormValues = z.infer<typeof createAdvisingRequestSchema>;
