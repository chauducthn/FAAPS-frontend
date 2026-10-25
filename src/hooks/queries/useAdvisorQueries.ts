// src/hooks/queries/useAdvisorQueries.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { advisorService } from '../../services/advisorService';
import type { AdvisingRequestStatus } from '../../types/advising';

export const ADVISOR_QUERY_KEYS = {
  all: ['advisor'] as const,
  students: (params: { search?: string; page: number; size: number }) =>
    ['advisor', 'students', params] as const,
  advisingRequests: (params: {
    status?: AdvisingRequestStatus;
    search?: string;
    page: number;
    size: number;
  }) => ['advisor', 'advising-requests', params] as const,
};

/** Sinh viên được phân công cho advisor hiện tại. */
export const useAdviseeStudents = (params: {
  search?: string;
  page: number;
  size: number;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.students(params),
    queryFn: () => advisorService.getAdviseeStudents(params),
    placeholderData: keepPreviousData,
  });

/** Yêu cầu tư vấn mà advisor nhận xử lý. */
export const useAdvisorAdvisingRequests = (params: {
  status?: AdvisingRequestStatus;
  search?: string;
  page: number;
  size: number;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.advisingRequests(params),
    queryFn: () => advisorService.getAdvisingRequests(params),
    placeholderData: keepPreviousData,
  });
