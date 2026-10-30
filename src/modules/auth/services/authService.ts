import axios from 'axios';
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { User } from '../types/auth';
import type { CurriculumChoice } from './onboardingService';

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  studentCode: string;
  curriculumVersionId: string;
  phone?: string;
}

let meRequest: Promise<User | null> | null = null;

export const authService = {
  /** Email + password sign-in for the Admin and for students who registered with a password. */
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    // Backend flow: GET /auth/csrf sets the XSRF-TOKEN cookie and returns
    // { headerName, token } -> POST login carries the token in that header.
    const { data } = await apiClient.post<User>('/auth/login', credentials, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  /** Manual student registration. The account is active and signed in as soon as it is created. */
  register: async (body: RegisterBody): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/register', body, { headers: await getCsrfHeaders() });
    return data;
  },

  registerCurriculums: async (): Promise<CurriculumChoice[]> =>
    (await apiClient.get<CurriculumChoice[]>('/auth/register/curriculums')).data,

  // React runs the bootstrap effect twice in development; the refresh token rotates on use, so share one request.
  getMe: (): Promise<User | null> => {
    meRequest ??= (async () => {
      try {
        const { data } = await apiClient.get<User>('/auth/me');
        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return authService.restoreSession();
        }
        throw error;
      }
    })().finally(() => {
      meRequest = null;
    });
    return meRequest;
  },

  /** The session cookie is gone or expired: the longer-lived refresh cookie can still sign the user back in. */
  restoreSession: async (): Promise<User | null> => {
    try {
      const { data } = await apiClient.post<User>('/auth/refresh', null, { headers: await getCsrfHeaders() });
      return data;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', null, { headers: await getCsrfHeaders() });
  },
};
