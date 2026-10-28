// src/services/management/cohort.service.ts
// A cohort is the same backend record as a curriculum (major + version); only the URL differs.
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { ApiResponse } from '../../../shared/types/api';
import type { CurriculumItem, CurriculumStatus } from '../../academic/types/curriculum';
import { createCurriculumApi } from './curriculum.service';

export const cohortService = {
  ...createCurriculumApi('/admin/cohorts'),

  // There is no /cohorts/{id}/status endpoint; the curriculum one acts on the same record.
  updateStatus: async (id: string, status: CurriculumStatus): Promise<CurriculumItem> => {
    const { data } = await apiClient.patch<ApiResponse<CurriculumItem>>(`/admin/curriculums/${id}/status`, { status },
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not change the status');
    return data.data;
  },
};
