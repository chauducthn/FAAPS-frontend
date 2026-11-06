// src/services/management/course.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { ApiResponse, PaginatedData } from '../../../shared/types/api';
import { isCurriculumMockEnabled, mockDelay } from '../mocks/mockConfig';
import { MOCK_CATEGORIES, MOCK_COURSE_BY_ID, MOCK_COURSES } from '../mocks/curriculumSupportMockData';
import type {
  CourseDetail,
  CourseRelation,
  CourseFilterParams,
  CourseSummary,
  CreateCourseDto,
  UpdateCourseDto,
  AddCourseRelationDto,
  UpdateCourseRelationDto,
  CourseCategory,
  CourseImportPreview,
} from '../../academic/types/course';

interface BackendCoursePage {
  items: CourseSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface BackendPrerequisite {
  id: string;
  prerequisiteCourseId: string;
  prerequisiteCode: string;
  prerequisiteName: string;
  groupNo: number;
  type: CourseRelation['kind'];
  minimumScore: number | null;
}

interface BackendCourseDetail extends Omit<CourseDetail, 'relations'> {
  prerequisites: BackendPrerequisite[];
}

const toCourseDetail = (course: BackendCourseDetail): CourseDetail => ({
  ...course,
  relations: course.prerequisites.map((relation) => ({
    relationId: relation.id,
    kind: relation.type,
    groupNo: relation.groupNo,
    otherCourseId: relation.prerequisiteCourseId,
    otherCourseCode: relation.prerequisiteCode,
    otherCourseName: relation.prerequisiteName,
    minimumScore: relation.minimumScore,
  })),
});

const toCourseSummary = (course: BackendCourseDetail | CourseDetail): CourseSummary => ({
  id: course.id,
  code: course.code,
  name: course.name,
  credits: course.credits,
  categoryId: course.categoryId,
  categoryCode: course.categoryCode,
  categoryName: course.categoryName,
  specialization: (course as CourseDetail).specialization ?? null,
  status: course.status,
  prerequisiteCount: 'prerequisites' in course
    ? course.prerequisites.length
    : course.prerequisiteCount,
  usedInCurriculumCount: course.usedInCurriculumCount,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});

export const courseService = {
  list: async (params?: CourseFilterParams): Promise<PaginatedData<CourseSummary>> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      const search = params?.search?.trim().toLowerCase();
      const filtered = MOCK_COURSES.filter((course) => {
        if (params?.status && params.status !== 'ALL' && course.status !== params.status) return false;
        if (params?.categoryId && course.categoryId !== params.categoryId) return false;
        if (params?.specialization && params.specialization !== 'ALL' && (course.specialization ?? '') !== params.specialization) return false;
        if (!search) return true;
        return course.code.toLowerCase().includes(search) || course.name.toLowerCase().includes(search);
      });
      const size = params?.size ?? 20;
      const page = params?.page ?? 0;
      return {
        items: filtered.slice(page * size, page * size + size).map(toCourseSummary),
        page,
        pageSize: size,
        totalItems: filtered.length,
        totalPages: size > 0 ? Math.ceil(filtered.length / size) : 0,
      };
    }

    const { data } = await apiClient.get<BackendCoursePage>(
      '/admin/courses',
      { params },
    );
    return {
      items: data.items,
      page: data.page,
      pageSize: data.size,
      totalItems: data.totalElements,
      totalPages: data.totalPages,
    };
  },

  listCategories: async (): Promise<CourseCategory[]> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return MOCK_CATEGORIES.map((c) => ({ id: c.id, code: c.code, name: c.name }));
    }
    const { data } = await apiClient.get<CourseCategory[]>('/admin/course-categories');
    return data;
  },

  getById: async (id: string): Promise<CourseDetail> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      const found = MOCK_COURSE_BY_ID.get(id);
      if (!found) throw new Error('Not found');
      return found;
    }
    const { data } = await apiClient.get<BackendCourseDetail>(`/admin/courses/${id}`);
    return toCourseDetail(data);
  },

  create: async (body: CreateCourseDto): Promise<CourseSummary> => {
    const { data } = await apiClient.post<BackendCourseDetail>('/admin/courses', body);
    return toCourseSummary(data);
  },

  update: async (id: string, body: UpdateCourseDto): Promise<CourseSummary> => {
    const { data } = await apiClient.put<BackendCourseDetail>(
      `/admin/courses/${id}`,
      body,
    );
    return toCourseSummary(data);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/courses/${id}`);
  },

  bulkRemove: async (ids: string[]): Promise<number> => {
    const { data } = await apiClient.post<{ deletedCount: number }>('/admin/courses/bulk-delete', { ids });
    return data.deletedCount;
  },
  previewImport: async (file: File): Promise<CourseImportPreview> => {
    const body = new FormData(); body.append('file', file);
    return (await apiClient.post<CourseImportPreview>('/admin/courses/import/preview', body,
      { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: async (items: CourseImportPreview['items']): Promise<number> => {
    const valid = items.filter((item) => item.errors.length === 0).map((item) => ({
      code: item.code, name: item.name, credits: item.credits, categoryId: item.categoryId,
      description: item.description, prerequisites: item.prerequisites,
      objectives: item.objectives, learningOutcomes: item.learningOutcomes,
    }));
    return (await apiClient.post<{ importedCount: number }>('/admin/courses/import/confirm', { items: valid })).data.importedCount;
  },
  downloadImportErrors: async (items: CourseImportPreview['items']): Promise<Blob> =>
    (await apiClient.post('/admin/courses/import/errors.xlsx', { items }, {
      headers: await getCsrfHeaders(), responseType: 'blob',
    })).data as Blob,

  listRelations: async (courseId: string): Promise<CourseRelation[]> => {
    const { data } = await apiClient.get<ApiResponse<CourseRelation[]>>(
      `/admin/courses/${courseId}/relations`,
    );
    return data.data ?? [];
  },

  addRelation: async (courseId: string, body: AddCourseRelationDto): Promise<CourseRelation> => {
    const { data } = await apiClient.post<ApiResponse<CourseRelation>>(
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
  ): Promise<CourseRelation> => {
    const { data } = await apiClient.put<ApiResponse<CourseRelation>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
      body,
    );
    if (!data.data) throw new Error('Could not update course relation');
    return data.data;
  },

  removeRelation: async (courseId: string, relationId: string): Promise<CourseRelation> => {
    const { data } = await apiClient.delete<ApiResponse<CourseRelation>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
    );
    if (!data.data) throw new Error('Could not remove course relation');
    return data.data;
  },
};
