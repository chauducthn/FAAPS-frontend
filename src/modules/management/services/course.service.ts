// src/services/management/course.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { ApiResponse, PaginatedData } from '../../../shared/types/api';
import { isCurriculumMockEnabled, mockDelay } from '../mocks/mockConfig';
import { MOCK_CATEGORIES } from '../mocks/curriculumSupportMockData';
import {
  buildMockCoursePage,
  mockAddCourseRelation,
  mockBulkRemoveCourses,
  mockConfirmCourseImport,
  mockCourseImportErrorBlob,
  mockCreateCourse,
  mockGetCourseById,
  mockPreviewCourseImport,
  mockRemoveCourse,
  mockRemoveCourseRelation,
  mockUpdateCourse,
  mockUpdateCourseRelation,
} from '../mocks/courseMockApi';
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
      return buildMockCoursePage(params);
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
      return mockGetCourseById(id);
    }
    const { data } = await apiClient.get<BackendCourseDetail>(`/admin/courses/${id}`);
    return toCourseDetail(data);
  },

  create: async (body: CreateCourseDto): Promise<CourseSummary> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockCreateCourse(body);
    }
    const { data } = await apiClient.post<BackendCourseDetail>('/admin/courses', body);
    return toCourseSummary(data);
  },

  update: async (id: string, body: UpdateCourseDto): Promise<CourseSummary> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateCourse(id, body);
    }
    const { data } = await apiClient.put<BackendCourseDetail>(
      `/admin/courses/${id}`,
      body,
    );
    return toCourseSummary(data);
  },

  remove: async (id: string): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      mockRemoveCourse(id);
      return;
    }
    await apiClient.delete(`/admin/courses/${id}`);
  },

  bulkRemove: async (ids: string[]): Promise<number> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockBulkRemoveCourses(ids);
    }
    const { data } = await apiClient.post<{ deletedCount: number }>('/admin/courses/bulk-delete', { ids });
    return data.deletedCount;
  },
  previewImport: async (file: File): Promise<CourseImportPreview> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockPreviewCourseImport(file?.name);
    }
    const body = new FormData(); body.append('file', file);
    return (await apiClient.post<CourseImportPreview>('/admin/courses/import/preview', body,
      { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: async (items: CourseImportPreview['items']): Promise<number> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockConfirmCourseImport(items);
    }
    const valid = items.filter((item) => item.errors.length === 0).map((item) => ({
      code: item.code, name: item.name, credits: item.credits, categoryId: item.categoryId,
      description: item.description, prerequisites: item.prerequisites,
      objectives: item.objectives, learningOutcomes: item.learningOutcomes,
    }));
    return (await apiClient.post<{ importedCount: number }>('/admin/courses/import/confirm', { items: valid })).data.importedCount;
  },
  downloadImportErrors: async (items: CourseImportPreview['items']): Promise<Blob> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockCourseImportErrorBlob(items);
    }
    return (await apiClient.post('/admin/courses/import/errors.xlsx', { items }, {
      headers: await getCsrfHeaders(), responseType: 'blob',
    })).data as Blob;
  },

  listRelations: async (courseId: string): Promise<CourseRelation[]> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockGetCourseById(courseId).relations;
    }
    const { data } = await apiClient.get<ApiResponse<CourseRelation[]>>(
      `/admin/courses/${courseId}/relations`,
    );
    return data.data ?? [];
  },

  addRelation: async (courseId: string, body: AddCourseRelationDto): Promise<CourseRelation> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockAddCourseRelation(courseId, body);
    }
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
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateCourseRelation(courseId, relationId, body);
    }
    const { data } = await apiClient.put<ApiResponse<CourseRelation>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
      body,
    );
    if (!data.data) throw new Error('Could not update course relation');
    return data.data;
  },

  removeRelation: async (courseId: string, relationId: string): Promise<CourseRelation> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockRemoveCourseRelation(courseId, relationId);
    }
    const { data } = await apiClient.delete<ApiResponse<CourseRelation>>(
      `/admin/courses/${courseId}/relations/${relationId}`,
    );
    if (!data.data) throw new Error('Could not remove course relation');
    return data.data;
  },
};
