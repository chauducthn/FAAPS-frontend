// src/types/academic-rule.ts
// DBML reference:
//   academic_policies (curriculum_version_id, policy_type, condition_expression,
//                      restriction_expression, approval_required, priority,
//                      description, display_message, is_active)
//   graduation_requirements (curriculum_version_id, requirement_type, description,
//                            min_credits, min_gpa, category_id, course_id, is_mandatory)
//
// Lifecycle (mock + UI): DRAFT -> ACTIVE (Publish) -> INACTIVE (Archive).
// ACTIVE rules are read-only. The backend only knows `is_active`, so the
// service maps `status === 'ACTIVE'` <-> `isActive: true` on the wire.

export type AcademicRuleType =
  | 'ADVANCED_STUDY'
  | 'RETAKE'
  | 'MAX_CREDITS_PER_SEMESTER'
  | 'MIN_CREDITS_PER_SEMESTER'
  | 'COURSE_REPEAT_LIMIT'
  | 'GPA_WARNING'
  | 'ACADEMIC_PROBATION'
  | 'OTHER';

/** Publishing lifecycle of a rule. */
export type AcademicRuleStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export interface AcademicRule {
  id: string;
  curriculumVersionId: string;
  curriculumName: string;     // BE resolves for display
  policyType: AcademicRuleType;
  /** Publishing lifecycle. `ACTIVE` rules are read-only in the UI. */
  status: AcademicRuleStatus;
  // Free-form JSON returned by BE; FE treats it as opaque
  condition: Record<string, unknown>;
  restriction: Record<string, unknown>;
  approvalRequired: boolean;
  priority: number;
  description: string | null;
  displayMessage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicRuleFilterParams {
  search?: string;
  curriculumVersionId?: string;
  policyType?: AcademicRuleType | 'ALL';
  /** Preferred filter. Kept side-by-side with `isActive` for backend compat. */
  status?: AcademicRuleStatus | 'ALL';
  isActive?: boolean | 'ALL';
  page?: number;
  size?: number;
  sort?: 'priority,asc' | 'priority,desc' | 'updatedAt,desc' | 'createdAt,desc';
}

export interface CreateAcademicRuleDto {
  curriculumVersionId: string;
  policyType: AcademicRuleType;
  condition: Record<string, unknown>;
  restriction?: Record<string, unknown>;
  approvalRequired?: boolean;
  priority?: number;
  description?: string | null;
  displayMessage?: string | null;
  /** New rules start as DRAFT unless stated otherwise. */
  status?: AcademicRuleStatus;
  isActive?: boolean;
}

export interface UpdateAcademicRuleDto extends Partial<CreateAcademicRuleDto> {}

export interface ToggleAcademicRuleStatusDto {
  isActive: boolean;
}

export interface UpdateAcademicRuleStatusDto {
  status: AcademicRuleStatus;
}
