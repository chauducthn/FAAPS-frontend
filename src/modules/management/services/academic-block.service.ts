import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';

export type AcademicBlockType = 'PREP' | 'MAIN' | 'FAST' | 'INTENSIVE';

export interface AcademicSemesterLimits {
  maxCreditsPerSemester: number;
  maxCoursesPerSemester: number;
  prepPartsPerSemester: number;
}

export interface AcademicBlockItem {
  id: string;
  code: string;
  name: string;
  blockType: AcademicBlockType;
  durationWeeks: number;
  maxCourses: number;
  maxCredits: number;
  sortOrder: number;
  active: boolean;
  description: string | null;
}

export interface AcademicBlockInput {
  code: string;
  name: string;
  blockType: AcademicBlockType;
  durationWeeks: number;
  maxCourses: number;
  maxCredits: number;
  sortOrder?: number;
  active?: boolean;
  description?: string | null;
}

export interface AcademicBlockConfigView {
  limits: AcademicSemesterLimits;
  blocks: AcademicBlockItem[];
}

export const ACADEMIC_BLOCK_QUERY_KEY = ['academic-blocks'] as const;

export const academicBlockService = {
  getAdminConfig: async (): Promise<AcademicBlockConfigView> =>
    (await apiClient.get<AcademicBlockConfigView>('/admin/academic-blocks')).data,

  getStudentConfig: async (): Promise<AcademicBlockConfigView> =>
    (await apiClient.get<AcademicBlockConfigView>('/student/academic-blocks')).data,

  updateLimits: async (limits: AcademicSemesterLimits): Promise<AcademicSemesterLimits> =>
    (await apiClient.put<AcademicSemesterLimits>('/admin/academic-blocks/limits', limits, {
      headers: await getCsrfHeaders(),
    })).data,

  createBlock: async (input: AcademicBlockInput): Promise<AcademicBlockItem> =>
    (await apiClient.post<AcademicBlockItem>('/admin/academic-blocks', input, {
      headers: await getCsrfHeaders(),
    })).data,

  updateBlock: async (id: string, input: AcademicBlockInput): Promise<AcademicBlockItem> =>
    (await apiClient.put<AcademicBlockItem>(`/admin/academic-blocks/${id}`, input, {
      headers: await getCsrfHeaders(),
    })).data,

  deleteBlock: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/academic-blocks/${id}`, { headers: await getCsrfHeaders() });
  },
};
