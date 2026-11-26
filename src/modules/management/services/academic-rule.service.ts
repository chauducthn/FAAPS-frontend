import { apiClient } from '../../../shared/lib/apiClient';
import type { PaginatedData } from '../../../shared/types/api';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleStatus,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
} from '../../academic/types/academic-rule';
import { toRequest, toRule, type BackendPage, type BackendRule } from './academic-rule.mapper';

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

  summary: async (): Promise<{ total: number; active: number; draft: number; inactive: number }> => {
    const { data } = await apiClient.get<{ total: number; active: number; draft: number; inactive: number }>(
      '/admin/academic-rules/summary',
    );
    return data;
  },

  seedFlmDefaults: async (): Promise<{ created: number; skipped: number }> => {
    const { data } = await apiClient.post<{ created: number; skipped: number }>(
      '/admin/academic-rules/seed-flm',
    );
    return data;
  },
};
