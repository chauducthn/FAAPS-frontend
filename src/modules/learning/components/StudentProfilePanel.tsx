import { BookOpen, GraduationCap, Hash, Star, Wallet } from '@phosphor-icons/react';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileCard, ProfileMetaRow, profileMetaListClass } from '@/shared/components/profile/ProfileCard';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { InlineAlert } from '@/shared/components/ui/InlineAlert';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  PROBATION: 'Probation',
  SUSPENDED: 'Suspended',
  GRADUATED: 'Graduated',
};

/** The student's own profile: identity, academic snapshot, editable details and password. Used by the header drawer. */
export function StudentProfilePanel() {
  const { data, isLoading, isError, refetch } = useMyProfile();
  const identityQuery = useIdentityProfile();
  const user = useAuth((state) => state.user);
  const save = useProfileSave({ successMessage: 'Profile saved' });
  const identity = identityQuery.data;

  const statusLabel = STATUS_LABEL[data?.academicStatus ?? 'ACTIVE'] ?? STATUS_LABEL.ACTIVE;

  return (
    <div className="flex flex-col gap-3">
      <ProfileHero
        fullName={identity?.fullName ?? user?.fullName}
        subtitle={`${data?.studentCode ? `${data.studentCode} · ` : ''}${identity?.email ?? user?.email ?? ''}`}
        roleBadge={data ? statusLabel : 'Student'}
        avatarUrl={identity?.avatarUrl ?? user?.avatarUrl}
        isLoading={identityQuery.isLoading}
      />

      {isError || identityQuery.isError ? (
        <InlineAlert tone="error" role="alert">
          Unable to load your profile.{' '}
          <button
            type="button"
            onClick={() => {
              refetch();
              identityQuery.refetch();
            }}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </InlineAlert>
      ) : isLoading || identityQuery.isLoading || !data || !identity ? (
        <div className="flex flex-col gap-3">
          <div className="h-44 animate-pulse rounded-lg border border-line bg-white" />
          <div className="h-60 animate-pulse rounded-lg border border-line bg-white" />
        </div>
      ) : (
        <>
          <ProfileCard title="Academic" description="Your program and progress so far">
            <dl className={profileMetaListClass}>
              <ProfileMetaRow icon={<Hash aria-hidden />} label="Student ID">
                <span className="font-mono">{data.studentCode || '—'}</span>
              </ProfileMetaRow>
              <ProfileMetaRow icon={<GraduationCap aria-hidden />} label="Major & cohort">
                {data.majorCode ? `${data.majorCode}${data.cohort ? ` · ${data.cohort}` : ''}` : 'Not set'}
              </ProfileMetaRow>
              <ProfileMetaRow icon={<BookOpen aria-hidden />} label="Current term">
                Semester {data.currentSemester}
              </ProfileMetaRow>
              <ProfileMetaRow icon={<Star aria-hidden />} label="Current GPA">
                {data.currentGpa !== null ? `${data.currentGpa.toFixed(2)} / 10` : 'No grades'}
              </ProfileMetaRow>
              <ProfileMetaRow icon={<Wallet aria-hidden />} label="Credits earned">
                {data.totalCreditsEarned} cr
              </ProfileMetaRow>
            </dl>
          </ProfileCard>
          <PersonalInfoForm
            email={identity.email}
            dateOfBirth={identity.dateOfBirth}
            initialValues={{ fullName: identity.fullName, phone: identity.phone ?? '' }}
            editableEmailAndDob
            isSaving={save.isPending}
            onSave={(values) => save.mutate(values)}
          />
          <ChangePasswordCard authProvider={identity.authProvider} />
        </>
      )}
    </div>
  );
}
