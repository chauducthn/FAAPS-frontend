import { useQuery } from '@tanstack/react-query';
import { profileService, type UserProfileDto } from '@/shared/services/profileService';

export const IDENTITY_QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
};

/**
 * The identity of the signed-in user, shared by every role. The name, phone, email, date of birth and account
 * metadata all come from this single query, so the three profile screens can never disagree about them.
 */
export const useIdentityProfile = () =>
  useQuery({
    queryKey: IDENTITY_QUERY_KEYS.profile,
    queryFn: profileService.getProfile,
  });

export type { UserProfileDto };
