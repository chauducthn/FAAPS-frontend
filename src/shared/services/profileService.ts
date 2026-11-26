import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';

/**
 * The identity fields of the signed-in user. This is the single source of truth for the name, phone, email and
 * account metadata of every role — the role-specific endpoints only add the data that is unique to that role
 * (a student curriculum, an advisor specialty).
 */
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
  avatarUrl?: string | null;
}

export interface UpdateBaseProfileBody {
  fullName: string;
  phone: string | null;
  email?: string;
  dateOfBirth?: string | null;
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

  uploadAvatar: async (file: File): Promise<UserProfileDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<UserProfileDto>('/profile/avatar', formData, {
      headers: {
        ...(await getCsrfHeaders()),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  removeAvatar: async (): Promise<UserProfileDto> => {
    const { data } = await apiClient.delete<UserProfileDto>('/profile/avatar', {
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
