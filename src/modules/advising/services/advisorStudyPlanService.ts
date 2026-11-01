import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { AdvisorStudyPlanDetail, StudyPlanDecision, StudyPlanPage } from '../types/study-plan';

const base = '/advisor/study-plans';
export const advisorStudyPlanService = {
  list: async (status: string, page = 0, size = 20): Promise<StudyPlanPage> => {
    return (await apiClient.get<StudyPlanPage>(base, { params: { status, page, size } })).data;
  },

  detail: async (id: string): Promise<AdvisorStudyPlanDetail> => {
    return (await apiClient.get<AdvisorStudyPlanDetail>(`${base}/${id}`)).data;
  },

  decide: async (id: string, decision: StudyPlanDecision, comment: string): Promise<AdvisorStudyPlanDetail> => {
    return (await apiClient.post<AdvisorStudyPlanDetail>(`${base}/${id}/decision`, { decision, comment },
      { headers: await getCsrfHeaders() })).data;
  },
};
