import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from '@phosphor-icons/react';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { InlineAlert } from '@/shared/components/ui/InlineAlert';
import { toolbarButtonClass } from '@/shared/components/ui/MenuParts';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';
import { advisorService } from '../services/advisorService';
import { AdvisorWorkloadCard } from './AdvisorWorkloadCard';

const ADVISOR_PROFILE_KEY = ['advisor', 'profile'] as const;

/** The advisor's own profile: identity, advising load, editable details and password. Used by the header drawer. */
export function AdvisorProfilePanel() {
  const user = useAuth((state) => state.user);
  const identityQuery = useIdentityProfile();
  const roleQuery = useQuery({
    queryKey: ADVISOR_PROFILE_KEY,
    queryFn: advisorService.getProfile,
  });

  // The identity fields are shared with every role; only the specialty is specific to an advisor.
  const save = useProfileSave({
    saveRoleFields: (values) => advisorService.updateSpecialization(values.specialization ?? null),
    onSaved: () => roleQuery.refetch(),
  });

  const identity = identityQuery.data;
  const role = roleQuery.data;

  return (
    <div className="flex flex-col gap-3">
      <ProfileHero
        fullName={identity?.fullName ?? user?.fullName}
        subtitle={identity?.email ?? user?.email ?? 'Academic Advisor'}
        roleBadge="Academic Advisor"
        avatarUrl={identity?.avatarUrl ?? user?.avatarUrl}
        isLoading={identityQuery.isLoading}
        action={
          <Link to="/advisor/students" className={toolbarButtonClass()}>
            My Students <ArrowRight className="size-4 text-ink-subtle" aria-hidden />
          </Link>
        }
      />

      {identityQuery.isError || roleQuery.isError ? (
        <InlineAlert tone="error" role="alert">
          Could not load your profile.{' '}
          <button
            type="button"
            onClick={() => {
              identityQuery.refetch();
              roleQuery.refetch();
            }}
            className="font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </InlineAlert>
      ) : identityQuery.isLoading || !identity || !role ? (
        <div className="flex flex-col gap-3">
          <div className="h-40 animate-pulse rounded-lg border border-line bg-white" />
          <div className="h-60 animate-pulse rounded-lg border border-line bg-white" />
        </div>
      ) : (
        <>
          <AdvisorWorkloadCard profile={role} />
          <PersonalInfoForm
            email={identity.email}
            dateOfBirth={identity.dateOfBirth}
            showSpecialization
            initialValues={{
              fullName: identity.fullName,
              phone: identity.phone ?? '',
              specialization: role.specialization ?? '',
            }}
            isSaving={save.isPending}
            onSave={(values) => save.mutate(values)}
          />
          <ChangePasswordCard authProvider={identity.authProvider} />
        </>
      )}
    </div>
  );
}
