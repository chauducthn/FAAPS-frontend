// Academic rules — wire mapping between the FE model and the backend payloads.
//
// Contract drift (FE-only change, backend untouched):
//   * Rules are system-wide now, so `curriculumVersionId` is no longer sent.
//     The backend still marks it `@NotNull` on create, so the request may be
//     rejected until the backend catches up — the omission is logged loudly.
//   * `ruleName` and `grade` are new FE fields. The backend does not expose
//     them yet, so they travel inside the `condition` payload where they are
//     preserved, and `grade` is also read back out of the condition.
import { apiClient } from '../../../shared/lib/apiClient';
import type { PaginatedData } from '../../../shared/types/api';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleStatus,
  AcademicRuleType,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
} from '../../academic/types/academic-rule';

interface BackendRule {
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
  /** Backend mới: DRAFT / ACTIVE / INACTIVE. Backend cũ chỉ có is_active. */
  status?: AcademicRuleStatus | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendPage {
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
      ? parsed as Record<string, unknown>
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

const toRule = (rule: BackendRule): AcademicRule => {
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
 * The backend still requires `curriculumVersionId` on create. The FE no longer
 * picks a curriculum (rules apply system-wide), so the field is left out and
 * the mismatch is reported instead of failing silently.
 */
const warnAboutCurriculumPayload = (body: CreateAcademicRuleDto | UpdateAcademicRuleDto) => {
  console.warn(
    '[academic-rule] Sending payload without `curriculumVersionId`. '
      + 'Rules are system-wide, but the backend still declares the field as required on create — '
      + 'the request may be rejected until the backend accepts system-wide rules.',
    { payload: body },
  );
};

/**
 * Maps the FE body onto the wire format. `ruleName` and `grade` are folded
 * into the condition payload so they survive the round-trip while the backend
 * contract catches up.
 */
const toRequest = (body: CreateAcademicRuleDto | UpdateAcademicRuleDto) => {
  const condition: Record<string, unknown> = { ...(body.condition ?? {}) };
  if (body.ruleName !== undefined) condition.rule_name = body.ruleName;
  if (body.grade !== undefined && body.grade !== null) condition.grade = body.grade;

  const payload = {
    ...body,
    // Not part of the FE contract anymore.
    curriculumVersionId: undefined,
    displayMessage: undefined,
    condition: undefined,
    restriction: undefined,
    conditionExpression: JSON.stringify(condition),
    restrictionExpression:
      body.restriction === undefined ? undefined : JSON.stringify(body.restriction),
  };

  warnAboutCurriculumPayload(body);

  return payload;
};

export const academicRuleService = {
  list: async (params?: AcademicRuleFilterParams): Promise<PaginatedData<AcademicRule>> => {
    const { data } = await apiClient.get<BackendPage>('/admin/academic-rules', {
      params: {
        ...params,
        isActive: undefined,
        status: params?.status && params.status !== 'ALL'
          ? params.status
          : params?.isActive === undefined
            ? undefined
            : params.isActive
              ? 'ACTIVE'
              : 'INACTIVE',
      },
    });
    return {
      items: data.items.map(toRule),
      page: data.page,
      pageSize: data.size,
      totalItems: data.totalElements,
      totalPages: data.totalPages,
    };
  },

  getById: async (id: string): Promise<AcademicRule> => {
    const { data } = await apiClient.get<BackendRule>(`/admin/academic-rules/${id}`);
    return toRule(data);
  },

  create: async (body: CreateAcademicRuleDto): Promise<AcademicRule> => {
    const { data } = await apiClient.post<BackendRule>('/admin/academic-rules', toRequest(body));
    return toRule(data);
  },

  update: async (id: string, body: UpdateAcademicRuleDto): Promise<AcademicRule> => {
    const { data } = await apiClient.put<BackendRule>(`/admin/academic-rules/${id}`, toRequest(body));
    return toRule(data);
  },

  toggle: async (id: string, body: ToggleAcademicRuleStatusDto): Promise<AcademicRule> => {
    const { data } = await apiClient.patch<BackendRule>(`/admin/academic-rules/${id}/status`, body);
    return toRule(data);
  },

  updateStatus: async (id: string, status: AcademicRuleStatus): Promise<AcademicRule> => {
    const { data } = await apiClient.patch<BackendRule>(`/admin/academic-rules/${id}/status`, {
      status,
      isActive: status === 'ACTIVE',
    });
    return toRule(data);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/academic-rules/${id}`);
  },
};
