// src/services/admin/course.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  CourseDetail,
  CourseFilterParams,
  CourseSummary,
  CreateCourseDto,
  UpdateCourseDto,
  AddCourseRelationDto,
  UpdateCourseRelationDto,
  CourseCategory,
} from '../../types/course';

export const courseService = {
  list: async (params?: CourseFilterParams): Promise<PaginatedData<CourseSummary>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<CourseSummary>>>(
      '/admin/courses',
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

  listCategories: async (): Promise<CourseCategory[]> => {
    const { data } = await apiClient.get<ApiResponse<CourseCategory[]>>(
      '/admin/course-categories',
    );
    return data.data ?? [];
  },

  getById: async (id: string): Promise<CourseDetail> => {
    const { data } = await apiClient.get<ApiResponse<CourseDetail>>(`/admin/courses/${id}`);
    if (!data.data) throw new Error('Course not found');
    return data.data;
  },

  create: async (body: CreateCourseDto): Promise<CourseSummary> => {
    const { data } = await apiClient.post<ApiResponse<CourseSummary>>('/admin/courses', body);
    if (!data.data) throw new Error('Could not create the course');
    return data.data;
  },

  update: async (id: string, body: UpdateCourseDto): Promise<CourseSummary> => {
    const { data } = await apiClient.put<ApiResponse<CourseSummary>>(
      `/admin/courses/${id}`,
      body,
    );
    if (!data.data) throw new Error('Could not update the course');
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/courses/${id}`);
  },

  addRelation: async (courseId: string, body: AddCourseRelationDto): Promise<CourseDetail> => {
    const { data } = await apiClient.post<ApiResponse<CourseDetail>>(
      `/admin/courses/${courseId}/relations`,
      body,
    );
    if (!data.data) throw new Error('Could not add course relation');
    return data.data;
  },

  updateRelation: async (
    courseId: string,
    relationId: string,
    body: UpdateCourseRelationDto,
  ): Promise<CourseDetail> => {
    const { data } = await apiClient.put<ApiResponse<CourseDetail>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
      body,
    );
    if (!data.data) throw new Error('Could not update course relation');
    return data.data;
  },

  removeRelation: async (courseId: string, relationId: string): Promise<CourseDetail> => {
    const { data } = await apiClient.delete<ApiResponse<CourseDetail>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
    );
    if (!data.data) throw new Error('Could not remove course relation');
    return data.data;
  },
};