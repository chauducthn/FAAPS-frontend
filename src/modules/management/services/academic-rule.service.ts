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
import { isCurriculumMockEnabled, mockDelay } from '../mocks/mockConfig';
import {
  buildMockRulePage,
  mockCreateRule,
  mockGetRuleById,
  mockRemoveRule,
  mockToggleRule,
  mockUpdateRule,
  mockUpdateRuleStatus,
} from '../mocks/academicRuleMockApi';

interface BackendRule extends Omit<AcademicRule, 'condition' | 'restriction' | 'status'> {
  conditionExpression: string | null;
  restrictionExpression: string | null;
  /** Backend mới: DRAFT / ACTIVE / INACTIVE. Backend cũ chỉ có is_active. */
  status?: AcademicRuleStatus | null;
}

interface BackendPage {
  items: BackendRule[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

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

const toRule = (rule: BackendRule): AcademicRule => ({
  id: rule.id,
  curriculumVersionId: rule.curriculumVersionId,
  curriculumName: rule.curriculumName,
  policyType: rule.policyType as AcademicRuleType,
  status: toStatus(rule),
  condition: parseExpression(rule.conditionExpression),
  restriction: parseExpression(rule.restrictionExpression),
  approvalRequired: rule.approvalRequired,
  priority: rule.priority,
  description: rule.description,
  displayMessage: rule.displayMessage,
  isActive: rule.isActive,
  createdAt: rule.createdAt,
  updatedAt: rule.updatedAt,
});

const toRequest = (body: CreateAcademicRuleDto | UpdateAcademicRuleDto) => ({
  ...body,
  condition: undefined,
  restriction: undefined,
  conditionExpression: body.condition === undefined ? undefined : JSON.stringify(body.condition),
  restrictionExpression: body.restriction === undefined ? undefined : JSON.stringify(body.restriction),
});

const CURRICULUM_NAME_FALLBACK: Record<string, string> = {
  'cv-0003': 'SE_K21 - Software Engineering K21',
  'cv-0004': 'SE_K22 - Software Engineering K22',
  'cv-0007': 'IT_K21 - Information Technology K21',
  'cv-0010': 'CE_K21 - Computer Engineering K21',
  'cv-0013': 'BA_K21 - Business Administration K21',
};

const resolveCurriculumName = (id: string): string => {
  const found = CURRICULUM_NAME_FALLBACK[id];
  return found ?? id;
};

const withCurriculumName = (rule: AcademicRule): AcademicRule => {
  if (rule.curriculumName && rule.curriculumName !== rule.curriculumVersionId) return rule;
  return { ...rule, curriculumName: resolveCurriculumName(rule.curriculumVersionId) };
};

const toMockParams = (params?: AcademicRuleFilterParams): AcademicRuleFilterParams | undefined => {
  if (!params) return undefined;
  const status = params.status && params.status !== 'ALL' ? params.status : undefined;
  const fromActive = params.isActive === undefined || params.isActive === 'ALL'
    ? undefined
    : params.isActive
      ? 'ACTIVE'
      : 'INACTIVE';
  return { ...params, status: status ?? (fromActive as AcademicRuleStatus | undefined) };
};

export const academicRuleService = {
  list: async (params?: AcademicRuleFilterParams): Promise<PaginatedData<AcademicRule>> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      const page = buildMockRulePage(toMockParams(params));
      return {
        items: page.items.map(withCurriculumName),
        page: page.page,
        pageSize: page.size,
        totalItems: page.totalItems,
        totalPages: page.totalPages,
      };
    }
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
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return withCurriculumName(mockGetRuleById(id));
    }
    const { data } = await apiClient.get<BackendRule>(`/admin/academic-rules/${id}`);
    return toRule(data);
  },

  create: async (body: CreateAcademicRuleDto): Promise<AcademicRule> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return withCurriculumName(mockCreateRule(body));
    }
    const { data } = await apiClient.post<BackendRule>('/admin/academic-rules', toRequest(body));
    return toRule(data);
  },

  update: async (id: string, body: UpdateAcademicRuleDto): Promise<AcademicRule> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return withCurriculumName(mockUpdateRule(id, body));
    }
    const { data } = await apiClient.put<BackendRule>(`/admin/academic-rules/${id}`, toRequest(body));
    return toRule(data);
  },

  toggle: async (id: string, body: ToggleAcademicRuleStatusDto): Promise<AcademicRule> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return withCurriculumName(mockToggleRule(id, body.isActive));
    }
    const { data } = await apiClient.patch<BackendRule>(`/admin/academic-rules/${id}/status`, body);
    return toRule(data);
  },

  updateStatus: async (id: string, status: AcademicRuleStatus): Promise<AcademicRule> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return withCurriculumName(mockUpdateRuleStatus(id, status));
    }
    const { data } = await apiClient.patch<BackendRule>(`/admin/academic-rules/${id}/status`, {
      status,
      isActive: status === 'ACTIVE',
    });
    return toRule(data);
  },

  remove: async (id: string): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      mockRemoveRule(id);
      return;
    }
    await apiClient.delete(`/admin/academic-rules/${id}`);
  },
};
