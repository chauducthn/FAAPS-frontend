// src/services/admin/major.service.ts
import { apiClient } from '../../lib/apiClient';
import { Major, MajorFilterParams, CreateMajorDto, UpdateMajorDto } from '../../types/major';
import { ApiResponse, PaginatedData } from '../../types/api';

export const majorService = {
  getMajors: async (params?: MajorFilterParams): Promise<PaginatedData<Major>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Major>>>('/admin/majors/paged', { params });
    
    const defaultPaginatedData: PaginatedData<Major> = {
      items: [],
      page: 0,
      pageSize: params?.size ?? 20,
      totalItems: 0,
      totalPages: 0,
    };

    return response.data.data ?? defaultPaginatedData;
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
};
