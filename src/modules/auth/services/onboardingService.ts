import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';
import type { AcademicStudentProfile } from '@/modules/academic/services/studentAcademicService';

export interface CurriculumChoice {
  id: string;
  version: string;
  name: string;
  majorCode: string;
  majorName: string;
}

export interface CompleteRegistrationBody {
  studentCode: string;
  curriculumVersionId: string;
  dateOfBirth: string;
  phone?: string;
}

/** Second step of student registration: the first Google sign-in has no academic profile yet. */
export const onboardingService = {
  curriculums: async (): Promise<CurriculumChoice[]> =>
    (await apiClient.get<CurriculumChoice[]>('/student/onboarding/curriculums')).data,

  complete: async (body: CompleteRegistrationBody): Promise<AcademicStudentProfile> =>
    (await apiClient.put<AcademicStudentProfile>('/student/onboarding', body, { headers: await getCsrfHeaders() })).data,
};
