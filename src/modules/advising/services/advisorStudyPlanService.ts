import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { IS_MOCK_MODE } from '@/config/mockConfig';
import type { AdvisorStudyPlanDetail, StudyPlanDecision, StudyPlanPage } from '../types/study-plan';
import { mockStudyPlanDetail, mockStudyPlanPage, mockDelay } from '@/mocks/advisorMockData';

const base = '/advisor/study-plans';
export const advisorStudyPlanService = {
  list: async (status: string, page = 0, size = 20): Promise<StudyPlanPage> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockStudyPlanPage(status, page, size);
    }
    return (await apiClient.get<StudyPlanPage>(base, { params: { status, page, size } })).data;
  },

  detail: async (id: string): Promise<AdvisorStudyPlanDetail> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockStudyPlanDetail(id);
    }
    return (await apiClient.get<AdvisorStudyPlanDetail>(`${base}/${id}`)).data;
  },

  decide: async (id: string, decision: StudyPlanDecision, comment: string): Promise<AdvisorStudyPlanDetail> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const detail = mockStudyPlanDetail(id);
      detail.plan.header.status = decision;
      detail.plan.header.reviewNotes = comment;
      detail.plan.header.reviewedAt = new Date().toISOString();
      return detail;
    }
    return (await apiClient.post<AdvisorStudyPlanDetail>(`${base}/${id}/decision`, { decision, comment },
      { headers: await getCsrfHeaders() })).data;
  },
};
