// Academic rules — wire mapping between the FE model and the backend payloads.
//
// Contract drift (FE-only change, backend untouched):
//   * Rules are system-wide now, so `curriculumVersionId` is no longer sent.
//     The backend still marks it `@NotNull` on create, so the request may be
//     rejected until the backend catches up — the omission is logged loudly.
//   * `ruleName` and `grade` are new FE fields. The backend does not expose
//     them yet, so they travel inside the `condition` payload where they are
//     preserved, and `grade` is also read back out of the condition.
import type {
  AcademicRule,
  AcademicRuleStatus,
  AcademicRuleType,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
} from '../../academic/types/academic-rule';

export interface BackendRule {
  id: string;
  curriculumVersionId?: string | null;
  curriculumName?: string | null;
  policyType: string;
  conditionExpression: string | null;
  restrictionExpression: string | null;
  approvalRequired: boolean;
  priority: number;
  description: string | null;
  displayMessage?: string | null;
  isActive: boolean;
  /** New backend: DRAFT / ACTIVE / INACTIVE. Legacy backend only has is_active. */
  status?: AcademicRuleStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPage {
  items: BackendRule[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Condition keys that can carry the numeric boundary of the rule. */
const GRADE_KEYS = [
  'grade',
  'min_gpa',
  'max_credits',
  'min_credits',
  'max_repeats',
  'max_attempts',
  'max_score_for_retake',
  'min_credits_earned',
  'min_attendance_percent',
] as const;

const parseExpression = (value: string | null): Record<string, unknown> => {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const toStatus = (rule: BackendRule): AcademicRuleStatus => {
  if (rule.status === 'DRAFT' || rule.status === 'ACTIVE' || rule.status === 'INACTIVE') {
    return rule.status;
  }
  return rule.isActive ? 'ACTIVE' : 'INACTIVE';
};

/** Reads the numeric boundary out of the condition payload. */
const readGrade = (condition: Record<string, unknown>): number | null => {
  for (const key of GRADE_KEYS) {
    const value = condition[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
};

/** Falls back to a readable name so the table never shows a blank cell. */
const readRuleName = (rule: BackendRule, condition: Record<string, unknown>): string => {
  const fromCondition = condition.rule_name;
  if (typeof fromCondition === 'string' && fromCondition.trim() !== '') {
    return fromCondition.trim();
  }
  return rule.description?.trim() || rule.policyType;
};

export const toRule = (rule: BackendRule): AcademicRule => {
  const condition = parseExpression(rule.conditionExpression);
  return {
    id: rule.id,
    ruleName: readRuleName(rule, condition),
    policyType: rule.policyType as AcademicRuleType,
    status: toStatus(rule),
    condition,
    restriction: parseExpression(rule.restrictionExpression),
    approvalRequired: rule.approvalRequired,
    priority: rule.priority,
    description: rule.description,
    grade: readGrade(condition),
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
};

/**
 * Maps the FE body onto the wire format. `ruleName` and `grade` are folded
 * into the condition payload so they survive the round-trip.
 */
export const toRequest = (body: CreateAcademicRuleDto | UpdateAcademicRuleDto) => {
  const condition: Record<string, unknown> = { ...(body.condition ?? {}) };
  if (body.ruleName !== undefined) condition.rule_name = body.ruleName;
  if (body.grade !== undefined && body.grade !== null) condition.grade = body.grade;

  return {
    ...body,
    curriculumVersionId: undefined,
    displayMessage: body.ruleName,
    condition: undefined,
    restriction: undefined,
    conditionExpression: JSON.stringify(condition),
    restrictionExpression:
      body.restriction === undefined ? undefined : JSON.stringify(body.restriction),
  };
};
