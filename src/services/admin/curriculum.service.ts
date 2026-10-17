// src/services/admin/curriculum.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  CurriculumDetail,
  CurriculumSummary,
  CurriculumFilterParams,
  CreateCurriculumDto,
  UpdateCurriculumDto,
  AddCurriculumCourseDto,
  UpdateCurriculumCourseDto,
  CurriculumBulkRequest,
} from '../../types/curriculum';

export const curriculumService = {
  list: async (params?: CurriculumFilterParams): Promise<PaginatedData<CurriculumSummary>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<CurriculumSummary>>>(
      '/admin/curriculums',
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

  getById: async (id: string): Promise<CurriculumDetail> => {
    const { data } = await apiClient.get<ApiResponse<CurriculumDetail>>(
      `/admin/curriculums/${id}`,
    );
    if (!data.data) throw new Error('Curriculum not found');
    return data.data;
  },

  create: async (body: CreateCurriculumDto): Promise<CurriculumSummary> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumSummary>>(
      '/admin/curriculums',
      body,
    );
    if (!data.data) throw new Error('Could not create the curriculum');
    return data.data;
  },

  update: async (id: string, body: UpdateCurriculumDto): Promise<CurriculumSummary> => {
    const { data } = await apiClient.put<ApiResponse<CurriculumSummary>>(
      `/admin/curriculums/${id}`,
      body,
    );
    if (!data.data) throw new Error('Could not update the curriculum');
    return data.data;
  },

  publish: async (id: string): Promise<CurriculumSummary> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumSummary>>(
      `/admin/curriculums/${id}/publish`,
    );
    if (!data.data) throw new Error('Could not publish the curriculum');
    return data.data;
  },

  archive: async (id: string): Promise<CurriculumSummary> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumSummary>>(
      `/admin/curriculums/${id}/archive`,
    );
    if (!data.data) throw new Error('Could not archive the curriculum');
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/curriculums/${id}`);
  },

  addCourse: async (
    curriculumId: string,
    body: AddCurriculumCourseDto,
  ): Promise<CurriculumDetail> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumDetail>>(
      `/admin/curriculums/${curriculumId}/courses`,
      body,
    );
    if (!data.data) throw new Error('Could not add course to curriculum');
    return data.data;
  },

  updateCourse: async (
    curriculumId: string,
    curriculumCourseId: string,
    body: UpdateCurriculumCourseDto,
  ): Promise<CurriculumDetail> => {
    const { data } = await apiClient.put<ApiResponse<CurriculumDetail>>(
      `/admin/curriculums/${curriculumId}/courses/${curriculumCourseId}`,
      body,
    );
    if (!data.data) throw new Error('Could not update curriculum course');
    return data.data;
  },

  removeCourse: async (
    curriculumId: string,
    curriculumCourseId: string,
  ): Promise<CurriculumDetail> => {
    const { data } = await apiClient.delete<ApiResponse<CurriculumDetail>>(
      `/admin/curriculums/${curriculumId}/courses/${curriculumCourseId}`,
    );
    if (!data.data) throw new Error('Could not remove curriculum course');
    return data.data;
  },

  bulk: async (body: CurriculumBulkRequest): Promise<{ affected: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ affected: number }>>(
      '/admin/curriculums/bulk',
      body,
    );
    return data.data ?? { affected: 0 };
  },
};