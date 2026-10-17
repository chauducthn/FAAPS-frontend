// src/services/admin/import.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  ImportConfirmResult,
  ImportEntity,
  ImportJob,
  ImportJobFilterParams,
  ImportPreview,
  ImportPreset,
} from '../../types/import';

export const importService = {
  listJobs: async (params?: ImportJobFilterParams): Promise<PaginatedData<ImportJob>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<ImportJob>>>(
      '/admin/imports',
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

  listPresets: async (): Promise<ImportPreset[]> => {
    const { data } = await apiClient.get<ApiResponse<ImportPreset[]>>('/admin/imports/presets');
    return data.data ?? [];
  },

  // Step 1: upload file, server parses + validates, returns preview (no DB write)
  upload: async (entity: ImportEntity, file: File): Promise<ImportPreview> => {
    const form = new FormData();
    form.append('entity', entity);
    form.append('file', file);
    const { data } = await apiClient.post<ApiResponse<ImportPreview>>(
      '/admin/imports/preview',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    if (!data.data) throw new Error('Could not parse the file');
    return data.data;
  },

  // Step 2: BE re-validates current preview state (still no DB write)
  revalidatePreview: async (jobId: string, edits: ImportPreview): Promise<ImportPreview> => {
    const { data } = await apiClient.put<ApiResponse<ImportPreview>>(
      `/admin/imports/${jobId}/preview`,
      edits,
    );
    if (!data.data) throw new Error('Could not refresh preview');
    return data.data;
  },

  // Step 3: confirm, write to DB in a transaction
  confirm: async (jobId: string): Promise<ImportConfirmResult> => {
    const { data } = await apiClient.post<ApiResponse<ImportConfirmResult>>(
      `/admin/imports/${jobId}/confirm`,
    );
    if (!data.data) throw new Error('Could not confirm import');
    return data.data;
  },

  discard: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/admin/imports/${jobId}`);
  },
};