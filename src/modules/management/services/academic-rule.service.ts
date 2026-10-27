import { apiClient } from '../../../shared/lib/apiClient';
import type { PaginatedData } from '../../../shared/types/api';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleType,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
} from '../../academic/types/academic-rule';

interface BackendRule extends Omit<AcademicRule, 'condition' | 'restriction'> {
  conditionExpression: string | null;
  restrictionExpression: string | null;
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

const toRule = (rule: BackendRule): AcademicRule => ({
  id: rule.id,
  curriculumVersionId: rule.curriculumVersionId,
  curriculumName: rule.curriculumName,
  policyType: rule.policyType as AcademicRuleType,
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

export const academicRuleService = {
  list: async (params?: AcademicRuleFilterParams): Promise<PaginatedData<AcademicRule>> => {
    const { data } = await apiClient.get<BackendPage>('/admin/academic-rules', {
      params: {
        ...params,
        isActive: undefined,
        status: params?.isActive === undefined ? undefined : params.isActive ? 'ACTIVE' : 'INACTIVE',
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

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/academic-rules/${id}`);
  },
};
