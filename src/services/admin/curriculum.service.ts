// src/services/admin/curriculum.service.ts
// /admin/curriculums and /admin/cohorts are two URLs onto the same backend records, so one factory serves both.
import { apiClient } from '../../lib/apiClient';
import type { ApiResponse } from '../../types/api';
import type {
  AddCurriculumCoursesInput,
  CurriculumCourseItem,
  CurriculumFilterParams,
  CurriculumInput,
  CurriculumItem,
  CurriculumPage,
  CurriculumStatus,
} from '../../types/curriculum';

const unwrap = <T>(response: ApiResponse<T>, message: string): T => {
  if (response.data === undefined || response.data === null) throw new Error(message);
  return response.data;
};

export const createCurriculumApi = (base: '/admin/curriculums' | '/admin/cohorts') => ({
  list: async (params?: CurriculumFilterParams): Promise<CurriculumPage> => {
    const { data } = await apiClient.get<CurriculumPage>(base, { params });
    return data;
  },

  getById: async (id: string): Promise<CurriculumItem> => {
    const { data } = await apiClient.get<ApiResponse<CurriculumItem>>(`${base}/${id}`);
    return unwrap(data, 'Not found');
  },

  create: async (body: CurriculumInput): Promise<CurriculumItem> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumItem>>(base, body);
    return unwrap(data, 'Could not create');
  },

  update: async (id: string, body: CurriculumInput): Promise<CurriculumItem> => {
    const { data } = await apiClient.put<ApiResponse<CurriculumItem>>(`${base}/${id}`, body);
    return unwrap(data, 'Could not update');
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${base}/${id}`);
  },
});

export const curriculumService = {
  ...createCurriculumApi('/admin/curriculums'),

  updateStatus: async (id: string, status: CurriculumStatus): Promise<CurriculumItem> => {
    const { data } = await apiClient.patch<ApiResponse<CurriculumItem>>(`/admin/curriculums/${id}/status`, { status });
    return unwrap(data, 'Could not change the status');
  },

  listCourses: async (id: string): Promise<CurriculumCourseItem[]> => {
    const { data } = await apiClient.get<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`);
    return data.data ?? [];
  },

  addCourses: async (id: string, body: AddCurriculumCoursesInput): Promise<CurriculumCourseItem[]> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`, body);
    return data.data ?? [];
  },
};
