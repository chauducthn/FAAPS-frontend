// src/services/admin/course.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
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
} from '../../types/course';

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

const toCourseSummary = (course: BackendCourseDetail): CourseSummary => ({
  id: course.id,
  code: course.code,
  name: course.name,
  credits: course.credits,
  categoryId: course.categoryId,
  categoryCode: course.categoryCode,
  categoryName: course.categoryName,
  status: course.status,
  prerequisiteCount: course.prerequisites.length,
  usedInCurriculumCount: course.usedInCurriculumCount,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});

export const courseService = {
  list: async (params?: CourseFilterParams): Promise<PaginatedData<CourseSummary>> => {
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
    const { data } = await apiClient.get<CourseCategory[]>('/admin/course-categories');
    return data;
  },

  getById: async (id: string): Promise<CourseDetail> => {
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
