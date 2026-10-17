// src/validations/curriculum.schema.ts
import { z } from 'zod';

const uuid = z.string().uuid();

export const createCurriculumSchema = z.object({
  majorId: uuid,
  version: z
    .string()
    .min(1, 'Version is required')
    .max(50)
    .regex(/^[A-Za-z0-9._-]+$/, 'Only letters, numbers, dot, dash, underscore'),
  name: z.string().min(3, 'Name is required').max(255),
  effectiveFromSemesterId: uuid,
  effectiveToSemesterId: uuid.optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  isCurrent: z.boolean().optional(),
});

export const updateCurriculumSchema = createCurriculumSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export const addCurriculumCourseSchema = z.object({
  courseId: uuid,
  semesterNumber: z.number().int().min(1).max(20),
  isMandatory: z.boolean().default(true),
  groupName: z.string().max(100).optional(),
});

export const updateCurriculumCourseSchema = z.object({
  semesterNumber: z.number().int().min(1).max(20).optional(),
  isMandatory: z.boolean().optional(),
  groupName: z.string().max(100).nullable().optional(),
});

export type CreateCurriculumFormValues = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumFormValues = z.infer<typeof updateCurriculumSchema>;
export type AddCurriculumCourseFormValues = z.infer<typeof addCurriculumCourseSchema>;
export type UpdateCurriculumCourseFormValues = z.infer<typeof updateCurriculumCourseSchema>;