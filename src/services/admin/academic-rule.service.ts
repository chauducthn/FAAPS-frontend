// src/services/admin/academic-rule.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  CreateAcademicRuleDto,
  UpdateAcademicRuleDto,
  ToggleAcademicRuleStatusDto,
} from '../../types/academic-rule';

export const academicRuleService = {
  list: async (params?: AcademicRuleFilterParams): Promise<PaginatedData<AcademicRule>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<AcademicRule>>>(
      '/admin/academic-rules',
      { params },
    );
    return (
      data.data ?? {
        items: [],
        page: params?.page ?? 0,
        pageSize: params?.size ?? 20,
        totalItems: 0,
        totalPages: 0,
      }
    );
  },

  getById: async (id: string): Promise<AcademicRule> => {
    const { data } = await apiClient.get<ApiResponse<AcademicRule>>(
      `/admin/academic-rules/${id}`,
    );
    if (!data.data) throw new Error('Academic rule not found');
    return data.data;
  },

  create: async (body: CreateAcademicRuleDto): Promise<AcademicRule> => {
    const { data } = await apiClient.post<ApiResponse<AcademicRule>>(
      '/admin/academic-rules',
      body,
    );
    if (!data.data) throw new Error('Could not create the academic rule');
    return data.data;
  },

  update: async (id: string, body: UpdateAcademicRuleDto): Promise<AcademicRule> => {
    const { data } = await apiClient.put<ApiResponse<AcademicRule>>(
      `/admin/academic-rules/${id}`,
      body,
    );
    if (!data.data) throw new Error('Could not update the academic rule');
    return data.data;
  },

  toggle: async (id: string, body: ToggleAcademicRuleStatusDto): Promise<AcademicRule> => {
    const { data } = await apiClient.patch<ApiResponse<AcademicRule>>(
      `/admin/academic-rules/${id}/status`,
      body,
    );
    if (!data.data) throw new Error('Could not change rule status');
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/academic-rules/${id}`);
  },
};