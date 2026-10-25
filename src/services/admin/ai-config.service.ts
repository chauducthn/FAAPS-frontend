// src/services/admin/ai-config.service.ts
// Khi mock AI đang bật, các hàm dưới đây trả về dữ liệu giả (xem src/mocks/ai.ts) thay vì gọi API.
// Bật/tắt bằng nút "Demo data" trên header các trang AI hoặc VITE_MOCK_AI trong .env.

import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import {
  mockAiConfigs,
  mockAiPerformance,
  mockAiPresets,
} from '../../mocks/ai';
import { isMockAiEnabled } from '../../mocks';
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

/** Bản sao local để các thao tác sửa/xóa trong chế độ demo có hiệu lực. */
let localConfigs: AiConfig[] = [];

const getLocalConfigs = (): AiConfig[] => {
  if (localConfigs.length === 0) localConfigs = mockAiConfigs.map((c) => ({ ...c }));
  return localConfigs;
};

const filterConfigs = (params?: AiConfigFilterParams): AiConfig[] => {
  let rows = [...getLocalConfigs()];
  if (params?.purpose && params.purpose !== 'ALL') rows = rows.filter((c) => c.purpose === params.purpose);
  if (params?.provider && params.provider !== 'ALL') rows = rows.filter((c) => c.provider === params.provider);
  if (params?.isActive !== undefined && params.isActive !== 'ALL') rows = rows.filter((c) => c.isActive === params.isActive);
  if (params?.sort === 'name,asc') rows.sort((a, b) => a.name.localeCompare(b.name));
  if (params?.sort === 'updatedAt,desc') rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return rows;
};

export const aiConfigService = {
  list: async (params?: AiConfigFilterParams): Promise<PaginatedData<AiConfig>> => {
    if (isMockAiEnabled()) {
      const rows = filterConfigs(params);
      const page = params?.page ?? 0;
      const size = params?.size ?? 20;
      const start = page * size;
      return {
        items: rows.slice(start, start + size),
        page,
        pageSize: size,
        totalItems: rows.length,
        totalPages: Math.max(1, Math.ceil(rows.length / size)),
      };
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
    if (isMockAiEnabled()) return mockAiPresets;

    const { data } = await apiClient.get<ApiResponse<AiPreset[]>>('/admin/ai-configurations/presets');
    return data.data ?? [];
  },

  getById: async (id: string): Promise<AiConfig> => {
    if (isMockAiEnabled()) {
      const found = getLocalConfigs().find((c) => c.id === id);
      if (!found) throw new Error('AI config not found');
      return found;
    }

    const { data } = await apiClient.get<ApiResponse<AiConfig>>(
      `/admin/ai-configurations/${id}`,
    );
    if (!data.data) throw new Error('AI config not found');
    return data.data;
  },

  create: async (body: CreateAiConfigDto): Promise<AiConfig> => {
    if (isMockAiEnabled()) {
      const created: AiConfig = {
        id: `cfg-local-${Date.now()}`,
        name: body.name,
        provider: body.provider,
        modelName: body.modelName,
        purpose: body.purpose,
        temperature: body.temperature ?? 0.7,
        maxTokens: body.maxTokens ?? 2048,
        retrievalTopK: body.retrievalTopK ?? 5,
        similarityThreshold: body.similarityThreshold ?? null,
        timeoutSeconds: body.timeoutSeconds ?? 30,
        dailyRequestLimit: body.dailyRequestLimit ?? null,
        systemPrompt: body.systemPrompt ?? null,
        fallbackMessage: body.fallbackMessage ?? null,
        isActive: body.isActive ?? true,
        updatedByUserId: 'dev-admin',
        updatedAt: new Date().toISOString(),
      };
      getLocalConfigs().unshift(created);
      return created;
    }

    const { data } = await apiClient.post<ApiResponse<AiConfig>>(
      '/admin/ai-configurations',
      body,
    );
    if (!data.data) throw new Error('Could not create the AI configuration');
    return data.data;
  },

  update: async (id: string, body: UpdateAiConfigDto): Promise<AiConfig> => {
    if (isMockAiEnabled()) {
      const rows = getLocalConfigs();
      const index = rows.findIndex((c) => c.id === id);
      if (index < 0) throw new Error('AI config not found');
      const updated: AiConfig = {
        ...rows[index],
        ...body,
        id: rows[index].id,
        updatedAt: new Date().toISOString(),
      };
      rows[index] = updated;
      return updated;
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
    if (isMockAiEnabled()) {
      // Demo mode: giả lập độ trễ mạng cho giống thật, không gửi key ra ngoài.
      await new Promise((resolve) => setTimeout(resolve, 400));
      return;
    }
    await apiClient.put(`/admin/ai-configurations/${id}/secret`, body);
  },

  remove: async (id: string): Promise<void> => {
    if (isMockAiEnabled()) {
      localConfigs = getLocalConfigs().filter((c) => c.id !== id);
      return;
    }
    await apiClient.delete(`/admin/ai-configurations/${id}`);
  },

  // AI Performance
  getPerformance: async (
    params: AiPerformanceFilterParams,
  ): Promise<AiPerformanceResult> => {
    if (isMockAiEnabled()) return mockAiPerformance(params);

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
