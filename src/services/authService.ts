import axios from 'axios';
import { apiClient } from '../lib/apiClient';
import type { User } from '../types/auth';

const csrfHeaders = async () => {
  const { data } = await apiClient.get<{ headerName: string; token: string }>('/auth/csrf');
  return { [data.headerName]: data.token };
};

export const authService = {
  loginAdmin: async (credentials: { email: string; password: string }): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/admin/login', credentials, {
      headers: await csrfHeaders(),
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
    await apiClient.post('/auth/logout', null, { headers: await csrfHeaders() });
  },
};
