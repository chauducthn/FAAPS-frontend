import { AccountMetaCard } from '@/shared/components/profile/AccountMetaCard';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { InlineAlert } from '@/shared/components/ui/InlineAlert';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';

/** The admin's own profile: identity, editable details, password and account facts. Used by the header drawer. */
export function AdminProfilePanel() {
  const user = useAuth((state) => state.user);
  const profileQuery = useIdentityProfile();
  const save = useProfileSave();

  const data = profileQuery.data;

  return (
    <div className="flex flex-col gap-3">
      <ProfileHero
        fullName={data?.fullName ?? user?.fullName}
        subtitle={data?.email ?? user?.email ?? 'System Administrator'}
        roleBadge="System Administrator"
        avatarUrl={data?.avatarUrl ?? user?.avatarUrl}
        isLoading={profileQuery.isLoading}
      />

      {profileQuery.isError ? (
        <InlineAlert tone="error" role="alert">
          Unable to load your profile.{' '}
          <button type="button" onClick={() => profileQuery.refetch()} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </InlineAlert>
      ) : profileQuery.isLoading || !data ? (
        <div className="flex flex-col gap-3">
          <div className="h-52 animate-pulse rounded-lg border border-line bg-white" />
          <div className="h-44 animate-pulse rounded-lg border border-line bg-white" />
        </div>
      ) : (
        <>
          <PersonalInfoForm
            email={data.email}
            dateOfBirth={data.dateOfBirth}
            initialValues={{ fullName: data.fullName, phone: data.phone ?? '' }}
            isSaving={save.isPending}
            onSave={(values) => save.mutate(values)}
          />
          <ChangePasswordCard authProvider={data.authProvider} />
          <AccountMetaCard profile={data} />
        </>
      )}
    </div>
  );
}
