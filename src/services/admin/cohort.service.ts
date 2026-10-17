// src/services/admin/cohort.service.ts
import { apiClient } from '../../lib/apiClient';
import { ApiResponse, PaginatedData } from '../../types/api';
import type {
  Cohort,
  CohortFilterParams,
  CreateCohortDto,
  UpdateCohortDto,
  CohortMajorLink,
} from '../../types/cohort';

export const cohortService = {
  list: async (params?: CohortFilterParams): Promise<PaginatedData<Cohort>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Cohort>>>('/admin/cohorts', { params });
    return (
      data.data ?? {
        items: [],
        page: params?.page ?? 0,
        pageSize: params?.size ?? 20,
        totalItems: 0,
        totalPages: 0,
      }
    );
  },

  getById: async (id: string): Promise<Cohort> => {
    const { data } = await apiClient.get<ApiResponse<Cohort>>(`/admin/cohorts/${id}`);
    if (!data.data) throw new Error('Cohort not found');
    return data.data;
  },

  getMajors: async (cohortId: string): Promise<CohortMajorLink[]> => {
    const { data } = await apiClient.get<ApiResponse<CohortMajorLink[]>>(`/admin/cohorts/${cohortId}/majors`);
    return data.data ?? [];
  },

  create: async (body: CreateCohortDto): Promise<Cohort> => {
    const { data } = await apiClient.post<ApiResponse<Cohort>>('/admin/cohorts', body);
    if (!data.data) throw new Error('Could not create the cohort');
    return data.data;
  },

  update: async (id: string, body: UpdateCohortDto): Promise<Cohort> => {
    const { data } = await apiClient.put<ApiResponse<Cohort>>(`/admin/cohorts/${id}`, body);
    if (!data.data) throw new Error('Could not update the cohort');
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/cohorts/${id}`);
  },

  attachMajor: async (cohortId: string, majorId: string): Promise<CohortMajorLink> => {
    const { data } = await apiClient.post<ApiResponse<CohortMajorLink>>(
      `/admin/cohorts/${cohortId}/majors`,
      { majorId },
    );
    if (!data.data) throw new Error('Could not attach major to cohort');
    return data.data;
  },

  detachMajor: async (cohortId: string, majorId: string): Promise<void> => {
    await apiClient.delete(`/admin/cohorts/${cohortId}/majors/${majorId}`);
  },
};