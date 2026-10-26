// src/services/admin/ai-config.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  AiConfig,
  AiConfigFilterParams,
  AiConfigSecretDto,
  AiPerformanceFilterParams,
  AiPerformanceResult,
  AiPreset,
  CreateAiConfigDto,
  UpdateAiConfigDto,
} from '../../types/ai-config';

export const aiConfigService = {
  list: async (params?: AiConfigFilterParams): Promise<PaginatedData<AiConfig>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<AiConfig>>>(
      '/admin/ai-configurations',
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

  listPresets: async (): Promise<AiPreset[]> => {
    const { data } = await apiClient.get<ApiResponse<AiPreset[]>>('/admin/ai-configurations/presets');
    return data.data ?? [];
  },

  getById: async (id: string): Promise<AiConfig> => {
    const { data } = await apiClient.get<ApiResponse<AiConfig>>(
      `/admin/ai-configurations/${id}`,
    );
    if (!data.data) throw new Error('AI config not found');
    return data.data;
  },

  create: async (body: CreateAiConfigDto): Promise<AiConfig> => {
    const { data } = await apiClient.post<ApiResponse<AiConfig>>(
      '/admin/ai-configurations',
      body,
    );
    if (!data.data) throw new Error('Could not create the AI configuration');
    return data.data;
  },

  update: async (id: string, body: UpdateAiConfigDto): Promise<AiConfig> => {
    const { data } = await apiClient.put<ApiResponse<AiConfig>>(
      `/admin/ai-configurations/${id}`,
      body,
    );
    if (!data.data) throw new Error('Could not update the AI configuration');
    return data.data;
  },

  // Secret is write-only; never returned by GET endpoints
  setSecret: async (id: string, body: AiConfigSecretDto): Promise<void> => {
    await apiClient.put(`/admin/ai-configurations/${id}/secret`, body);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/ai-configurations/${id}`);
  },

  // AI Performance
  getPerformance: async (
    params: AiPerformanceFilterParams,
  ): Promise<AiPerformanceResult> => {
    const { data } = await apiClient.get<ApiResponse<AiPerformanceResult>>(
      '/admin/ai-configurations/performance',
      { params },
    );
    return (
      data.data ?? {
        summary: [],
        byDay: [],
      }
    );
  },
};
