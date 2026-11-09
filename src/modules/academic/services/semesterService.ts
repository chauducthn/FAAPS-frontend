import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';
import type { ApiResponse } from '@/shared/types/api';

export interface Semester {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

export type SemesterInput = Omit<Semester, 'id'>;

export const semesterService = {
  list: async (): Promise<Semester[]> => {
    const { data } = await apiClient.get<ApiResponse<Semester[]>>('/admin/semesters');
    return data.data ?? [];
  },
  create: async (input: SemesterInput): Promise<Semester> => {
    const { data } = await apiClient.post<ApiResponse<Semester>>('/admin/semesters', input,
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not create semester');
    return data.data;
  },
  update: async (id: string, input: SemesterInput): Promise<Semester> => {
    const { data } = await apiClient.put<ApiResponse<Semester>>(`/admin/semesters/${id}`, input,
      { headers: await getCsrfHeaders() });
    if (!data.data) throw new Error('Could not update semester');
    return data.data;
  },
};
