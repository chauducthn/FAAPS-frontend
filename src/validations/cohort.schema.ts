// src/validations/cohort.schema.ts
import { z } from 'zod';

// Base field validators (kept primitive so they can be reused in both schemas).
const dateString = z
  .string()
  .min(1, 'Start date is required')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

export const cohortCodeSchema = z
  .string()
  .min(2, 'Cohort code must be at least 2 characters')
  .max(20, 'Cohort code is too long')
  .regex(/^K\d{2,3}$/i, 'Cohort code must look like K18, K19, K20, ...');

/**
 * Note on cross-field validation:
 * We use `.superRefine` (not `.refine`) so the validator is a no-op when one of
 * the fields is missing. This lets us reuse the same shape logic inside
 * `updateCohortSchema` (where every field is optional) without runtime crashes
 * from Zod's ".partial() cannot be used on object schemas containing refinements".
 */

// CREATEschema: all fields required (except isCurrent)
export const createCohortSchema = z
  .object({
    code: cohortCodeSchema,
    name: z.string().min(2, 'Name is required').max(120),
    startDate: dateString,
    endDate: dateString,
    majorIds: z.array(z.string().uuid()).min(1, 'Attach at least one major'),
    isCurrent: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }
  });

// UPDATE schema: every field optional. We do NOT call .partial() on the create
// schema because the cross-field refinement makes that illegal in Zod 4.
export const updateCohortSchema = z
  .object({
    code: cohortCodeSchema.optional(),
    name: z.string().min(2, 'Name is required').max(120).optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    majorIds: z.array(z.string().uuid()).optional(),
    isCurrent: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    admissionStatus: z
      .enum(['PLANNED', 'INTAKE_OPEN', 'IN_PROGRESS', 'CLOSED'])
      .optional(),
  })
  .superRefine((v, ctx) => {
    // Only validate the date range when BOTH sides are provided on update.
    if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }
  });

export type CreateCohortFormValues = z.infer<typeof createCohortSchema>;
export type UpdateCohortFormValues = z.infer<typeof updateCohortSchema>;