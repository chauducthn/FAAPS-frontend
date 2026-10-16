import { apiClient } from './apiClient';

/** Fetches the CSRF token the backend expects on state-changing requests. */
export const getCsrfHeaders = async (): Promise<Record<string, string>> => {
  const { data } = await apiClient.get<{ headerName: string; token: string }>('/auth/csrf');
  return { [data.headerName]: data.token };
};
