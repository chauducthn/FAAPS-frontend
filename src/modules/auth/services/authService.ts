import axios from 'axios';
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { User } from '../types/auth';

export const authService = {
  loginAdmin: async (credentials: { email: string; password: string }): Promise<User> => {
    // Backend flow: GET /auth/csrf sets the XSRF-TOKEN cookie and returns
    // { headerName, token } -> POST login carries the token in that header.
    const { data } = await apiClient.post<User>('/auth/admin/login', credentials, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  getMe: async (): Promise<User | null> => {
    try {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', null, { headers: await getCsrfHeaders() });
  },
};
