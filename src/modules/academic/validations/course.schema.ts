// src/validations/course.schema.ts
import { z } from 'zod';

// Any 36-character hex id: the backend generates and validates the actual UUIDs.
// Mock catalogue uses readable ids (cat-01, course-se101), so accept any non-empty id.
const idRef = z.string().min(1, 'Select a valid option');

/** The only credit values a course can have (chosen from a list, never typed). */
export const CREDIT_OPTIONS = [0, 2, 3, 10] as const;
export const CREDIT_OPTIONS_MESSAGE = 'Credits must be 0, 2, 3 or 10';

export const createCourseSchema = z.object({
  code: z
    .string()
    .min(2, 'Course code is required')
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, dash, underscore only'),
  name: z.string().min(3, 'Course name is required').max(255),
  // Picked from CREDIT_OPTIONS; an empty pick reaches here as NaN.
  credits: z
    .number({ error: 'Select the number of credits' })
    .refine((v) => (CREDIT_OPTIONS as readonly number[]).includes(v), CREDIT_OPTIONS_MESSAGE),
  categoryId: z.string().min(1, 'Select a category'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  /** Link to the course materials (slides, syllabus PDF, drive folder). Optional. */
  materialLink: z
    .string()
    .trim()
    .max(500, 'Material link must be at most 500 characters')
    .refine((v) => v === '' || /^https?:\/\/\S+\.\S+/i.test(v), 'Enter a full link starting with http:// or https://')
    .optional(),
  /** Courses that must be passed first (create only). Each one is its own requirement. */
  prerequisiteIds: z.array(z.string().min(1)).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const addCourseRelationSchema = z.object({
  kind: z.enum(['PREREQUISITE', 'REPLACEMENT']),
  groupNo: z.number().int().min(1).max(20),
  otherCourseId: idRef,
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
