// src/services/management/curriculum.service.ts
// /admin/curriculums and /admin/cohorts are two URLs onto the same backend records, so one factory serves both.
//
// CONTRACT (đọc từ OpenAPI của backend):
//   GET    /admin/curriculums              -> Page<CurriculumItem>   (KHÔNG bọc ApiResponse)
//   GET    /admin/curriculums/{id}          -> ApiResponse<CurriculumItem>
//   GET    /admin/curriculums/{id}/courses  -> ApiResponse<CurriculumCourseItem[]>
//   GET    /admin/cohorts                  -> Page<CurriculumItem>
//
// Khi mock curriculum đang bật, MỌI thao tác (CRUD, status, courses, import)
// đều ghi trực tiếp vào mock store in-memory với delay 500ms để UI test được
// như backend thật (xem `../mocks/curriculumMockApi.ts`).
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
import { isCurriculumMockEnabled, mockDelay } from '../mocks/mockConfig';
import {
  buildMockCurriculumCourses,
  buildMockCurriculumPage,
  mockAddCurriculumCourses,
  mockConfirmCurriculumImport,
  mockCreateCurriculum,
  mockDeleteCurriculum,
  mockGetCurriculumById,
  mockPreviewCurriculumImport,
  mockRemoveCurriculumCourse,
  mockUpdateCurriculum,
  mockUpdateCurriculumCourse,
  mockUpdateCurriculumStatus,
  type MockImportPreview,
} from '../mocks/curriculumMockApi';

const unwrap = <T>(response: ApiResponse<T>, message: string): T => {
  if (response.data === undefined || response.data === null) throw new Error(message);
  return response.data;
};

/**
 * Backend trả về `Page` trần cho endpoint list. Một số bản deploy bọc trong
 * `ApiResponse`, nên đọc cả hai để không vỡ khi contract đổi vỏ.
 */
const toPage = <T>(payload: unknown): CurriculumPage => {
  const raw = payload as Partial<CurriculumPage> & { data?: Partial<CurriculumPage> };
  const source = raw?.items ? raw : (raw?.data ?? raw);
  const items = source?.items ?? [];
  const size = source?.size ?? items.length;
  const totalElements = source?.totalElements ?? items.length;
  return {
    items,
    page: source?.page ?? 0,
    size,
    totalElements,
    totalPages: source?.totalPages ?? (size > 0 ? Math.ceil(totalElements / size) : 0),
  };
};

/**
 * Gọi endpoint list của họ (curriculum hoặc cohort) và luôn trả về `Page`.
 * Đây là một đường đi duy nhất cho cả mock lẫn API thật.
 */
export const fetchCurriculumPage = async (
  base: '/admin/curriculums' | '/admin/cohorts',
  params: CurriculumFilterParams,
): Promise<CurriculumPage> => {
  if (isCurriculumMockEnabled()) {
    await mockDelay();
    return buildMockCurriculumPage(params);
  }
  const { data } = await apiClient.get<CurriculumPage | ApiResponse<CurriculumPage>>(base, { params });
  return toPage(data);
};

/**
 * Lấy danh sách curriculum (hoặc cohort — cùng bản ghi) theo dạng `Page`.
 *
 * @param page trang bắt đầu từ 0
 * @param size số bản ghi mỗi trang
 * @param filters bộ lọc tuỳ chọn: search, majorId, status, isCurrent
 */
export const getCurriculums = async (
  page = 0,
  size = 20,
  filters?: Omit<CurriculumFilterParams, 'page' | 'size'>,
): Promise<CurriculumPage> => {
  const params: CurriculumFilterParams = { ...filters, page, size };
  return fetchCurriculumPage('/admin/curriculums', params);
};

export const createCurriculumApi = (base: '/admin/curriculums' | '/admin/cohorts') => ({
  /**
   * Danh sách curriculum dạng `Page`: { items, page, size, totalElements, totalPages }.
   */
  list: async (params?: CurriculumFilterParams): Promise<CurriculumPage> =>
    fetchCurriculumPage(base, { ...params }),

  getById: async (id: string): Promise<CurriculumItem> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockGetCurriculumById(id);
    }
    const { data } = await apiClient.get<ApiResponse<CurriculumItem>>(`${base}/${id}`);
    return unwrap(data, 'Not found');
  },

  create: async (body: CurriculumInput): Promise<CurriculumItem> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockCreateCurriculum(body);
    }
    const { data } = await apiClient.post<ApiResponse<CurriculumItem>>(base, body,
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not create');
  },

  update: async (id: string, body: CurriculumInput): Promise<CurriculumItem> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateCurriculum(id, body);
    }
    const { data } = await apiClient.put<ApiResponse<CurriculumItem>>(`${base}/${id}`, body,
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not update');
  },

  remove: async (id: string): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      mockDeleteCurriculum(id);
      return;
    }
    await apiClient.delete(`${base}/${id}`, { headers: await getCsrfHeaders() });
  },
});

export const curriculumService = {
  ...createCurriculumApi('/admin/curriculums'),

  /** Wrapper rõ ràng cho endpoint list, nhận `page`/`size` và trả về `Page`. */
  getCurriculums,

  updateStatus: async (id: string, status: CurriculumStatus): Promise<CurriculumItem> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateCurriculumStatus(id, status);
    }
    const { data } = await apiClient.patch<ApiResponse<CurriculumItem>>(`/admin/curriculums/${id}/status`, { status },
      { headers: await getCsrfHeaders() });
    return unwrap(data, 'Could not change the status');
  },

  /** Danh sách môn học của một curriculum (mảng thuần). */
  listCourses: async (id: string): Promise<CurriculumCourseItem[]> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return buildMockCurriculumCourses(id);
    }
    const { data } = await apiClient.get<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`);
    return data.data ?? [];
  },

  addCourses: async (id: string, body: AddCurriculumCoursesInput): Promise<CurriculumCourseItem[]> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockAddCurriculumCourses(id, body);
    }
    const { data } = await apiClient.post<ApiResponse<CurriculumCourseItem[]>>(`/admin/curriculums/${id}/courses`, body,
      { headers: await getCsrfHeaders() });
    return data.data ?? [];
  },
  updateCourse: async (id: string, courseId: string, body: { semesterNumber: number; isMandatory?: boolean; groupName?: string | null }) => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockUpdateCurriculumCourse(id, courseId, body);
    }
    const { data } = await apiClient.patch<ApiResponse<CurriculumCourseItem>>(`/admin/curriculums/${id}/courses/${courseId}`, body,
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not update curriculum course');
    return data.data;
  },
  removeCourse: async (id: string, courseId: string): Promise<void> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      mockRemoveCurriculumCourse(id, courseId);
      return;
    }
    await apiClient.delete(`/admin/curriculums/${id}/courses/${courseId}`, { headers: await getCsrfHeaders() });
  },
  previewImport: async (id: string, file: File) => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockPreviewCurriculumImport(id, file?.name);
    }
    const body = new FormData(); body.append('file', file);
    return (await apiClient.post<{
      totalRows: number; validRows: number; errorRows: number;
      items: { rowNumber: number; courseCode: string; courseId: string; semesterNumber: number; mandatory: boolean; groupName: string | null; errors: string[] }[];
    }>(`/admin/curriculums/${id}/import/preview`, body, { headers: { ...await getCsrfHeaders(), 'Content-Type': 'multipart/form-data' } })).data;
  },
  confirmImport: async (id: string, preview: unknown): Promise<number> => {
    if (isCurriculumMockEnabled()) {
      await mockDelay();
      return mockConfirmCurriculumImport(id, preview as MockImportPreview);
    }
    return (await apiClient.post<{ importedCount: number }>(`/admin/curriculums/${id}/import/confirm`, preview,
      { headers: await getCsrfHeaders() })).data.importedCount;
  },
};
