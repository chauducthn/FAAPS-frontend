// src/services/management/major.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { Major, MajorFilterParams, CreateMajorDto, UpdateMajorDto } from '../../academic/types/major';
import { ApiResponse, PaginatedData } from '../../../shared/types/api';

export const majorService = {
  getMajors: async (params?: MajorFilterParams): Promise<PaginatedData<Major>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Major>> | PaginatedData<Major>>('/admin/majors/paged', { params });

    const defaultPaginatedData: PaginatedData<Major> = {
      items: [],
      page: 0,
      pageSize: params?.size ?? 20,
      totalItems: 0,
      totalPages: 0,
    };

    // Backend trả `Page` trần (items/page/size/totalElements/totalPages); bản deploy
    // cũ bọc trong `ApiResponse`. Đọc cả hai để không vỡ khi contract đổi vỏ.
    const payload = response.data as {
      data?: { items?: Major[]; page?: number; size?: number; pageSize?: number; totalElements?: number; totalItems?: number; totalPages?: number };
      items?: Major[];
      page?: number;
      size?: number;
      pageSize?: number;
      totalElements?: number;
      totalItems?: number;
      totalPages?: number;
    };
    const source = payload?.items ? payload : (payload?.data ?? payload);
    const items = source?.items ?? [];

    return {
      items,
      page: source?.page ?? 0,
      pageSize: source?.pageSize ?? source?.size ?? params?.size ?? 20,
      totalItems: source?.totalItems ?? source?.totalElements ?? items.length,
      totalPages: source?.totalPages ?? 0,
    };
  },

  getMajorById: async (id: string): Promise<Major> => {
    const response = await apiClient.get<ApiResponse<Major>>(`/admin/majors/${id}`);
    if (!response.data.data) {
      throw new Error('Major not found');
    }
    return response.data.data;
  },

  createMajor: async (data: CreateMajorDto): Promise<Major> => {
    const response = await apiClient.post<ApiResponse<Major>>('/admin/majors', data);
    if (!response.data.data) {
      throw new Error('Could not create the major');
    }
    return response.data.data;
  },

  updateMajor: async (id: string, data: UpdateMajorDto): Promise<Major> => {
    const response = await apiClient.put<ApiResponse<Major>>(`/admin/majors/${id}`, data);
    if (!response.data.data) {
      throw new Error('Could not update the major');
    }
    return response.data.data;
  },

  deleteMajor: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/majors/${id}`);
  },

  bulkRemove: async (ids: string[]): Promise<number> => {
    const { data } = await apiClient.post<{ deletedCount: number }>('/admin/majors/bulk-delete', { ids });
    return data.deletedCount;
  },
};
