// src/services/management/curriculum.service.ts
// /admin/curriculums and /admin/cohorts are two URLs onto the same backend records, so one factory serves both.
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  AddCurriculumCoursesInput,
  CurriculumCourseItem,
  CurriculumFilterParams,
  CurriculumInput,
  CurriculumItem,
  CurriculumPage,
  CurriculumStatus,
} from '../../academic/types/curriculum';

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
    const { data } = await apiClient.post<ApiResponse<CurriculumItem>>(base, body,
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not create');
  },

  update: async (id: string, body: CurriculumInput): Promise<CurriculumItem> => {
    const { data } = await apiClient.put<ApiResponse<CurriculumItem>>(`${base}/${id}`, body,
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not update');
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${base}/${id}`, { headers: await getCsrfHeaders() });
  },
});

export const curriculumService = {
  ...createCurriculumApi('/admin/curriculums'),

  updateStatus: async (id: string, status: CurriculumStatus): Promise<CurriculumItem> => {
    const { data } = await apiClient.patch<ApiResponse<CurriculumItem>>(`/admin/curriculums/${id}/status`, { status },
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not change the status');
  },

  listCourses: async (id: string): Promise<CurriculumCourseItem[]> => {
    const { data } = await apiClient.get<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`);
    return data.data ?? [];
  },

  addCourses: async (id: string, body: AddCurriculumCoursesInput): Promise<CurriculumCourseItem[]> => {
    const { data } = await apiClient.post<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`, body,
      { headers: await getCsrfHeaders() });
    return data.data ?? [];
  },
  updateCourse: async (id: string, courseId: string, body: { semesterNumber: number; isMandatory: boolean; groupName?: string | null }) => {
    const { data } = await apiClient.patch<ApiResponse<CurriculumCourseItem>>(`/admin/curriculums/${id}/courses/${courseId}`, body,
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not update curriculum course');
    return data.data;
  },
  removeCourse: async (id: string, courseId: string): Promise<void> => {
    await apiClient.delete(`/admin/curriculums/${id}/courses/${courseId}`, { headers: await getCsrfHeaders() });
  },
  previewImport: async (id: string, file: File) => {
    const body = new FormData(); body.append('file', file);
    return (await apiClient.post<{
      totalRows: number; validRows: number; errorRows: number;
      items: { rowNumber: number; courseCode: string; courseId: string; semesterNumber: number; mandatory: boolean; groupName: string | null; errors: string[] }[];
    }>(`/admin/curriculums/${id}/import/preview`, body, { headers: { ...await getCsrfHeaders(), 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: async (id: string, preview: unknown): Promise<number> =>
    (await apiClient.post<{ importedCount: number }>(`/admin/curriculums/${id}/import/confirm`, preview,
      { headers: await getCsrfHeaders() })).data.importedCount,
};
