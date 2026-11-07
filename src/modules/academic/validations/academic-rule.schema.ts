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

// Mock catalogue uses readable ids (cv-0004, rule-gpa-warning), so accept any non-empty id.
const idRef = z.string().min(1, 'Select a curriculum');
const jsonObject = z.record(z.string(), z.unknown());

export const createAcademicRuleSchema = z.object({
  curriculumVersionId: idRef,
  policyType: z.enum(POLICY_TYPES),
  condition: jsonObject.refine((v) => Object.keys(v).length > 0, {
    message: 'At least one condition is required',
  }),
  restriction: jsonObject.optional(),
  approvalRequired: z.boolean().optional(),
  priority: z.number().int().min(0, 'Priority must be at least 0').max(1000, 'Priority is at most 1000').optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  displayMessage: z.string().max(500, 'Display message is too long').optional().nullable(),
  status: z.enum(RULE_STATUSES).optional(),
  isActive: z.boolean().optional(),
});

export const updateAcademicRuleSchema = createAcademicRuleSchema.partial();
export const toggleAcademicRuleSchema = z.object({ isActive: z.boolean() });
export const updateRuleStatusSchema = z.object({ status: z.enum(RULE_STATUSES) });

export type CreateAcademicRuleFormValues = z.infer<typeof createAcademicRuleSchema>;
export type UpdateAcademicRuleFormValues = z.infer<typeof updateAcademicRuleSchema>;
export type ToggleAcademicRuleFormValues = z.infer<typeof toggleAcademicRuleSchema>;
export type UpdateRuleStatusFormValues = z.infer<typeof updateRuleStatusSchema>;

/** Gợi ý JSON mẫu cho từng policy type — hiển thị dưới ô nhập Condition. */
export const CONDITION_EXAMPLES: Record<string, string> = {
  GPA_WARNING: '{\n  "min_gpa": 5.0,\n  "operator": "<",\n  "scope": "semester_gpa"\n}',
  ACADEMIC_PROBATION: '{\n  "min_gpa": 4.5,\n  "consecutive_semesters": 2,\n  "operator": "<"\n}',
  MAX_CREDITS_PER_SEMESTER: '{\n  "max_credits": 24,\n  "scope": "semester_registration"\n}',
  MIN_CREDITS_PER_SEMESTER: '{\n  "min_credits": 12,\n  "scope": "semester_registration"\n}',
  OTHER: '{\n  "min_attendance_percent": 80,\n  "operator": "<",\n  "scope": "course_attendance"\n}',
};

/** Validate chuỗi JSON thô từ textarea; trả về lỗi hiển thị inline (null = hợp lệ). */
export function validateConditionJson(raw: string, opts?: { allowEmpty?: boolean }): string | null {
  const text = raw.trim();
  if (!text) return opts?.allowEmpty ? null : 'Condition is required — paste a JSON object.';
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return 'Condition must be a JSON object, e.g. {"min_gpa": 5.0}.';
    }
    if (Object.keys(parsed as Record<string, unknown>).length === 0 && !opts?.allowEmpty) {
      return 'At least one condition is required.';
    }
    return null;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return `Invalid JSON: ${message}. Check quotes, commas and brackets.`;
  }
}

export function parseConditionJson(raw: string): Record<string, unknown> {
  return JSON.parse(raw.trim() || '{}') as Record<string, unknown>;
}
