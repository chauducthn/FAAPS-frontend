// src/validations/course.schema.ts
import { z } from 'zod';

// Any 36-character hex id: the backend generates and validates the actual UUIDs.
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Select a valid option');

export const createCourseSchema = z.object({
  code: z
    .string()
    .min(2, 'Course code is required')
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, dash, underscore only'),
  name: z.string().min(3, 'Course name is required').max(255),
  credits: z.number({ error: 'Credits must be a number' }).int('Credits must be a whole number').min(1, 'Credits must be at least 1').max(20, 'Credits must be at most 20'),
  categoryId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Select a category'),
  description: z.string().max(2000).optional().nullable(),
  objectives: z.string().max(2000).optional().nullable(),
  learningOutcomes: z.string().max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const addCourseRelationSchema = z.object({
  kind: z.enum(['PREREQUISITE', 'REPLACEMENT']),
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
