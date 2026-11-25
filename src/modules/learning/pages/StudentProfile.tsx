import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

export default function StudentProfile() {
  const { data, isLoading, isError, refetch } = useMyProfile();
  const identityQuery = useIdentityProfile();
  const user = useAuth((state) => state.user);

  // A student has no role-specific field beyond the academic data, which the curriculum card writes on its own.
  const save = useProfileSave({ successMessage: 'Profile saved' });

  const identity = identityQuery.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-4">
      <ProfileHero
        fullName={identity?.fullName ?? user?.fullName}
        subtitle={`Student${data?.studentCode ? ` · ${data.studentCode}` : ''}${identity ? ` · ${identity.email}` : ''}`}
        isLoading={identityQuery.isLoading}
      />

      {isError || identityQuery.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200
          bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>Unable to load your profile.</span>
          <button
            type="button"
            onClick={() => { refetch(); identityQuery.refetch(); }}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : isLoading || identityQuery.isLoading || !data || !identity ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <PersonalInfoForm
              email={identity.email}
              dateOfBirth={identity.dateOfBirth}
              initialValues={{ fullName: identity.fullName, phone: identity.phone ?? '' }}
              isSaving={save.isPending}
              onSave={(values) => save.mutate(values)}
            />
            <ChangePasswordCard authProvider={identity.authProvider} />
          </div>
          <div className="space-y-5">
            <MajorCurriculumCard profile={data} />
            <StudentProfileCard profile={data} />
          </div>
        </div>
      )}
    </div>
  );
}
