import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  role: string;
  status: string;
  authProvider: string;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface UpdateBaseProfileBody {
  fullName: string;
  phone: string | null;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getProfile: async (): Promise<UserProfileDto> => {
    const { data } = await apiClient.get<UserProfileDto>('/profile');
    return data;
  },

  updateProfile: async (body: UpdateBaseProfileBody): Promise<UserProfileDto> => {
    const { data } = await apiClient.put<UserProfileDto>('/profile', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  changePassword: async (body: ChangePasswordBody): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/change-password',
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
