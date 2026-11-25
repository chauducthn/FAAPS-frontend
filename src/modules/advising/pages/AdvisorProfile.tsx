import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';
import { AdvisorWorkloadCard } from '../components/AdvisorWorkloadCard';
import { advisorService } from '../services/advisorService';
import { useQuery } from '@tanstack/react-query';

const ADVISOR_PROFILE_KEY = ['advisor', 'profile'] as const;

export default function AdvisorProfile() {
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-4">
      <ProfileHero
        fullName={identity?.fullName ?? user?.fullName}
        subtitle={`Academic Advisor${identity ? ` · ${identity.email}` : ''}`}
        isLoading={identityQuery.isLoading}
        action={
          <Link
            to="/advisor/students"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold
              text-[#c2410c] shadow-sm hover:bg-orange-50"
          >
            My Students <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      {identityQuery.isError || roleQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          Could not load your profile.{' '}
          <button type="button" onClick={() => { identityQuery.refetch(); roleQuery.refetch(); }} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : identityQuery.isLoading || !identity || !role ? (
        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <AdvisorWorkloadCard profile={role} />
          <div className="space-y-5">
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
          </div>
        </div>
      )}
    </div>
  );
}
