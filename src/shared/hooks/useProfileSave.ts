import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { profileService, type UserProfileDto } from '@/shared/services/profileService';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { IDENTITY_QUERY_KEYS } from './useIdentityProfile';

export interface ProfileSaveValues {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string | null;
  specialization?: string;
}

export interface UseProfileSaveOptions {
  /**
   * Persists the role-specific field (an advisor specialty, for example). The identity fields are always written
   * through the shared /api/profile endpoint, so this callback only has to deal with what makes the role unique.
   */
  saveRoleFields?: (values: ProfileSaveValues) => Promise<unknown>;
  /** Called after every write succeeded, e.g. to refresh the role-specific query. */
  onSaved?: () => Promise<unknown> | unknown;
  successMessage?: string;
}

/**
 * Writes the profile of the signed-in user: the identity fields go to /api/profile, the role-specific fields go
 * through the callback. Both writes are skipped when they have nothing to change.
 */
export const useProfileSave = ({
  saveRoleFields,
  onSaved,
  successMessage = 'Profile updated successfully',
}: UseProfileSaveOptions = {}) => {
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);

  return useMutation<UserProfileDto, unknown, ProfileSaveValues>({
    mutationFn: async (values) => {
      const updated = await profileService.updateProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || null,
        email: values.email?.trim() || undefined,
        dateOfBirth: values.dateOfBirth !== undefined ? values.dateOfBirth || null : undefined,
      });

      if (saveRoleFields) {
        await saveRoleFields(values);
      }

      return updated;
    },
    onSuccess: async (updated) => {
      if (user) {
        setUser({ ...user, fullName: updated.fullName, email: updated.email, avatarUrl: updated.avatarUrl });
      }
      await queryClient.invalidateQueries({ queryKey: IDENTITY_QUERY_KEYS.profile });
      await onSaved?.();
      toast.success(successMessage);
    },
    onError: (error) => toast.error(apiMessage(error)),
  });
};
