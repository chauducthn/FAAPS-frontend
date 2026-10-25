import { apiClient } from './apiClient';

export interface CsrfToken {
  headerName: string;
  token: string;
}

/**
 * Fetches the CSRF token the backend expects on state-changing requests.
 * Flow: GET /auth/csrf sets the XSRF-TOKEN cookie and returns
 * { headerName: "X-XSRF-TOKEN", token: "..." } — caller puts the token
 * into that header on the next POST/PUT/PATCH/DELETE (cookies go along
 * via withCredentials).
 */
export const getCsrfHeaders = async (): Promise<Record<string, string>> => {
  const { data } = await apiClient.get<CsrfToken>('/auth/csrf');
  return { [data.headerName]: data.token };
};
