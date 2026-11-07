import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { isAdvisorMockEnabled, mockDelay } from '../../../shared/lib/mockMode';
import type { AdvisorStudyPlanDetail, StudyPlanDecision, StudyPlanPage } from '../types/study-plan';
import {
  mockDecideStudyPlan,
  mockGetStudyPlanDetail,
  mockListStudyPlans,
} from '../mocks/advisorMockApi';

const base = '/advisor/study-plans';

/**
 * API kế hoạch học tập của advisor.
 * Khi mock bật, quyết định approve/reject/needs-revision ghi thẳng vào store
 * in-memory nên danh sách + KPI cập nhật ngay sau invalidate.
 */
export const advisorStudyPlanService = {
  list: async (status: string, page = 0, size = 20): Promise<StudyPlanPage> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockListStudyPlans(status, page, size);
    }
    return (await apiClient.get<StudyPlanPage>(base, { params: { status, page, size } })).data;
  },

  detail: async (id: string): Promise<AdvisorStudyPlanDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetStudyPlanDetail(id);
    }
    return (await apiClient.get<AdvisorStudyPlanDetail>(`${base}/${id}`)).data;
  },

  decide: async (id: string, decision: StudyPlanDecision, comment: string): Promise<AdvisorStudyPlanDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockDecideStudyPlan(id, decision, comment);
    }
    return (await apiClient.post<AdvisorStudyPlanDetail>(`${base}/${id}/decision`, { decision, comment },
      { headers: await getCsrfHeaders() })).data;
  },
};
