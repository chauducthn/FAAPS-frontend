// src/validations/academic-rule.schema.ts
import { z } from 'zod';

export const POLICY_TYPES = [
  'ADVANCED_STUDY',
  'RETAKE',
  'MAX_CREDITS_PER_SEMESTER',
  'MIN_CREDITS_PER_SEMESTER',
  'COURSE_REPEAT_LIMIT',
  'GPA_WARNING',
  'ACADEMIC_PROBATION',
  'OTHER',
] as const;

export const RULE_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE'] as const;

const jsonObject = z.record(z.string(), z.unknown());

export const createAcademicRuleSchema = z.object({
  ruleName: z
    .string()
    .trim()
    .min(1, 'Rule name is required')
    .max(120, 'Rule name is too long'),
  policyType: z.enum(POLICY_TYPES),
  condition: jsonObject.refine((v) => Object.keys(v).length > 0, {
    message: 'At least one condition is required',
  }),
  restriction: jsonObject.optional(),
  approvalRequired: z.boolean().optional(),
  priority: z.number().int().min(0, 'Priority must be at least 0').max(1000, 'Priority is at most 1000').optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  /** Numeric boundary of the rule (GPA point, credit count, ...). */
  grade: z.number().min(0, 'Grade must be at least 0').max(1000, 'Grade is too large').optional().nullable(),
  status: z.enum(RULE_STATUSES).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAcademicRuleFormValues = z.infer<typeof createAcademicRuleSchema>;

