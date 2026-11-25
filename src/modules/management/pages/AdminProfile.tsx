import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AccountMetaCard } from '@/shared/components/profile/AccountMetaCard';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm, type PersonalInfoValues } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { apiMessage } from '@/shared/lib/apiMessage';
import { profileService } from '@/shared/services/profileService';
import { useAuth } from '../../auth/stores/useAuth';

export default function AdminProfile() {
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);

  const profileQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: profileService.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (values: PersonalInfoValues) =>
      profileService.updateProfile({
        fullName: values.fullName,
        phone: values.phone || null,
      }),
    onSuccess: async (updated) => {
      if (user) {
        setUser({ ...user, fullName: updated.fullName });
      }
      await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => toast.error(apiMessage(error)),
  });

  const data = profileQuery.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <ProfileHero
        fullName={data?.fullName ?? user?.fullName}
        subtitle={`System Administrator${data ? ` · ${data.email}` : ''}`}
        isLoading={profileQuery.isLoading}
      />

      {profileQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          Unable to load your profile.{' '}
          <button type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : profileQuery.isLoading || !data ? (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <AccountMetaCard profile={data} />
          <div className="space-y-5">
            <PersonalInfoForm
              email={data.email}
              dateOfBirth={data.dateOfBirth}
              initialValues={{ fullName: data.fullName, phone: data.phone ?? '' }}
              isSaving={updateMutation.isPending}
              onSave={(values) => {
                updateMutation.mutate(values);
              }}
            />
            <ChangePasswordCard authProvider={data.authProvider} />
          </div>
        </div>
      )}
    </div>
  );
}
