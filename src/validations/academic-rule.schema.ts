// src/validations/academic-rule.schema.ts
import { z } from 'zod';

export const POLICY_TYPES = [
  'CO_REQUISITE',
  'ADVANCED_STUDY',
  'RETAKE',
  'MAX_CREDITS_PER_SEMESTER',
  'MIN_CREDITS_PER_SEMESTER',
  'COURSE_REPEAT_LIMIT',
  'GPA_WARNING',
  'ACADEMIC_PROBATION',
  'OTHER',
] as const;

const uuid = z.string().uuid();
const jsonObject = z.record(z.string(), z.unknown());

export const createAcademicRuleSchema = z.object({
  curriculumVersionId: uuid,
  policyType: z.enum(POLICY_TYPES),
  condition: jsonObject.refine((v) => Object.keys(v).length > 0, {
    message: 'At least one condition is required',
  }),
  restriction: jsonObject.optional(),
  approvalRequired: z.boolean().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  description: z.string().max(2000).optional().nullable(),
  displayMessage: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateAcademicRuleSchema = createAcademicRuleSchema.partial();
export const toggleAcademicRuleSchema = z.object({ isActive: z.boolean() });

export type CreateAcademicRuleFormValues = z.infer<typeof createAcademicRuleSchema>;
export type UpdateAcademicRuleFormValues = z.infer<typeof updateAcademicRuleSchema>;
export type ToggleAcademicRuleFormValues = z.infer<typeof toggleAcademicRuleSchema>;