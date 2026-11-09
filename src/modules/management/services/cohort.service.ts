// src/services/management/cohort.service.ts
// A cohort is the same backend record as a curriculum (major + version); only the URL differs.
//
// CONTRACT (đọc từ OpenAPI của backend):
//   GET /admin/cohorts         -> Page<CurriculumItem>   (KHÔNG bọc ApiResponse)
//   GET /admin/cohorts/{id}    -> ApiResponse<CurriculumItem>
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { ApiResponse } from '../../../shared/types/api';
import type { CurriculumFilterParams, CurriculumItem, CurriculumPage, CurriculumStatus } from '../../academic/types/curriculum';
import { createCurriculumApi, fetchCurriculumPage } from './curriculum.service';

export const cohortService = {
  ...createCurriculumApi('/admin/cohorts'),

  /**
   * Danh sách cohort dạng `Page`: { items, page, size, totalElements, totalPages }.
   * Trang Cohorts và trang Curriculum dùng chung bản ghi nên cùng một bộ dữ liệu.
   */
  getCohorts: async (
    page = 0,
    size = 20,
    filters?: Omit<CurriculumFilterParams, 'page' | 'size'>,
  ): Promise<CurriculumPage> => {
    const params: CurriculumFilterParams = { ...filters, page, size };
    return fetchCurriculumPage('/admin/cohorts', params);
  },

  // There is no /cohorts/{id}/status endpoint; the curriculum one acts on the same record.
  updateStatus: async (id: string, status: CurriculumStatus): Promise<CurriculumItem> => {
    const { data } = await apiClient.patch<ApiResponse<CurriculumItem>>(`/admin/curriculums/${id}/status`, { status },
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not change the status');
    return data.data;
  },
};
