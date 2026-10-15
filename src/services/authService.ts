import { apiClient } from '../lib/apiClient';
import { User } from '../types/auth';
import { ApiResponse } from '../types/api';
import { LoginFormValues } from '../validations/auth.schema';

export const authService = {
  loginAdmin: (data: LoginFormValues) => {
    return apiClient.post<any, ApiResponse>('/auth/admin/login', data);
  },

  loginGoogle: (accessToken: string) => {
    return apiClient.post<any, ApiResponse>('/auth/google', { token: accessToken });
  },

  getMe: () => {
    return apiClient.get<any, ApiResponse<User>>('/auth/me');
  },

  logout: () => {
    return apiClient.post<any, ApiResponse>('/auth/logout');
  },
};