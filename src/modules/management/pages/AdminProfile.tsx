import { AccountMetaCard } from '@/shared/components/profile/AccountMetaCard';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';

export default function AdminProfile() {
  const user = useAuth((state) => state.user);
  const profileQuery = useIdentityProfile();
  const save = useProfileSave();

  const data = profileQuery.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <ProfileHero
        fullName={data?.fullName ?? user?.fullName}
        subtitle={data?.email ?? user?.email ?? 'System Administrator'}
        roleBadge="System Administrator"
        avatarUrl={data?.avatarUrl ?? user?.avatarUrl}
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
              isSaving={save.isPending}
              onSave={(values) => save.mutate(values)}
            />
            <ChangePasswordCard authProvider={data.authProvider} />
          </div>
        </div>
      )}
    </div>
  );
}
