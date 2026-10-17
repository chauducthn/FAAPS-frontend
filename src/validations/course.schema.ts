// src/validations/course.schema.ts
import { z } from 'zod';

const uuid = z.string().uuid();

export const createCourseSchema = z.object({
  code: z
    .string()
    .min(2, 'Course code is required')
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, dash, underscore only'),
  name: z.string().min(3, 'Course name is required').max(255),
  credits: z.number().int().min(0).max(20),
  categoryId: uuid,
  description: z.string().max(2000).optional().nullable(),
  objectives: z.string().max(2000).optional().nullable(),
  learningOutcomes: z.string().max(2000).optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const addCourseRelationSchema = z.object({
  kind: z.enum(['PREREQUISITE', 'CO_REQUISITE', 'REPLACEMENT']),
  groupNo: z.number().int().min(1).max(20),
  otherCourseId: uuid,
  minimumScore: z
    .number()
    .min(0)
    .max(10)
    .nullable()
    .optional(),
});

export const updateCourseRelationSchema = z.object({
  groupNo: z.number().int().min(1).max(20).optional(),
  minimumScore: z.number().min(0).max(10).nullable().optional(),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
export type AddCourseRelationFormValues = z.infer<typeof addCourseRelationSchema>;
export type UpdateCourseRelationFormValues = z.infer<typeof updateCourseRelationSchema>;