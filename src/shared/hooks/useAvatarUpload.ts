import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { resizeAvatarFile } from '@/shared/lib/resizeAvatar';
import { profileService, type UserProfileDto } from '@/shared/services/profileService';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { IDENTITY_QUERY_KEYS } from './useIdentityProfile';

const MAX_RAW_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);

  const syncAvatar = async (updated: UserProfileDto) => {
    if (user) {
      setUser({ ...user, fullName: updated.fullName, avatarUrl: updated.avatarUrl });
    }
    queryClient.setQueryData(IDENTITY_QUERY_KEYS.profile, updated);
    await queryClient.invalidateQueries({ queryKey: IDENTITY_QUERY_KEYS.profile });
  };

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_MIME.has(file.type)) {
        throw new Error('Please choose a PNG, JPG, WebP, or GIF image.');
      }
      if (file.size > MAX_RAW_BYTES) {
        throw new Error('Image must be 5 MB or smaller.');
      }
      const processed = await resizeAvatarFile(file, 256);
      return profileService.uploadAvatar(processed);
    },
    onSuccess: async (updated) => {
      await syncAvatar(updated);
      toast.success('Avatar updated');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : apiMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => profileService.removeAvatar(),
    onSuccess: async (updated) => {
      await syncAvatar(updated);
      toast.success('Avatar removed');
    },
    onError: (err) => toast.error(apiMessage(err)),
  });

  return {
    uploadAvatar: upload.mutate,
    removeAvatar: remove.mutate,
    isUploading: upload.isPending,
    isRemoving: remove.isPending,
  };
}
