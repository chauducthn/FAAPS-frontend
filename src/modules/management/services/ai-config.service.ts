// src/services/management/ai-config.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { ApiResponse, PaginatedData } from '../../../shared/types/api';
import { isCurriculumMockEnabled, mockDelay } from '../mocks/mockConfig';
import {
  buildMockAiConfigPage,
  mockCreateAiConfig,
  mockGetAiConfigById,
  mockGetAiPerformance,
  mockListAiPresets,
  mockRemoveAiConfig,
  mockUpdateAiConfig,
} from '../mocks/aiConfigMockApi';
import type {
  AiConfig,
  AiConfigFilterParams,
  AiConfigSecretDto,
  AiPerformanceFilterParams,
  AiPerformanceResult,
  AiPreset,
  CreateAiConfigDto,
  UpdateAiConfigDto,
} from '../../ai/types/ai-config';

export const aiConfigService = {
  list: async (params?: AiConfigFilterParams): Promise<PaginatedData<AiConfig>> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return buildMockAiConfigPage(params);
    }
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
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockListAiPresets();
    }
    const { data } = await apiClient.get<ApiResponse<AiPreset[]>>('/admin/ai-configurations/presets');
    return data.data ?? [];
  },

  getById: async (id: string): Promise<AiConfig> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockGetAiConfigById(id);
    }
    const { data } = await apiClient.get<ApiResponse<AiConfig>>(
      `/admin/ai-configurations/${id}`,
    );
    if (!data.data) throw new Error('AI config not found');
    return data.data;
  },

  create: async (body: CreateAiConfigDto): Promise<AiConfig> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockCreateAiConfig(body);
    }
    const { data } = await apiClient.post<ApiResponse<AiConfig>>(
      '/admin/ai-configurations',
      body,
    );
    if (!data.data) throw new Error('Could not create the AI configuration');
    return data.data;
  },

  update: async (id: string, body: UpdateAiConfigDto): Promise<AiConfig> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateAiConfig(id, body);
    }
    const { data } = await apiClient.put<ApiResponse<AiConfig>>(
      `/admin/ai-configurations/${id}`,
      body,
    );
    if (!data.data) throw new Error('Could not update the AI configuration');
    return data.data;
  },

  // Secret is write-only; never returned by GET endpoints
  setSecret: async (id: string, body: AiConfigSecretDto): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return;
    }
    await apiClient.post(`/admin/ai-configurations/${id}/secret`, body);
  },

  remove: async (id: string): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      mockRemoveAiConfig(id);
      return;
    }
    await apiClient.delete(`/admin/ai-configurations/${id}`);
  },

  // AI Performance
  getPerformance: async (
    params: AiPerformanceFilterParams,
  ): Promise<AiPerformanceResult> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockGetAiPerformance(params);
    }
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
