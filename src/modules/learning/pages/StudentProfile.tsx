import { BookOpen, GraduationCap, Hash, Star, Wallet } from '@phosphor-icons/react';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import { useProfileSave } from '@/shared/hooks/useProfileSave';
import { useAuth } from '../../auth/stores/useAuth';
import { FlmPreferencesCard } from '../components/FlmPreferencesCard';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PROBATION: { label: 'Probation', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-red-50 text-red-700 ring-red-200' },
  GRADUATED: { label: 'Graduated', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
};

export default function StudentProfile() {
  const { data, isLoading, isError, refetch } = useMyProfile();
  const identityQuery = useIdentityProfile();
  const user = useAuth((state) => state.user);
  const save = useProfileSave({ successMessage: 'Profile saved' });
  const identity = identityQuery.data;

  const academicBadge = STATUS_BADGE[data?.academicStatus ?? 'ACTIVE'] ?? STATUS_BADGE.ACTIVE;
  const stats = data
    ? [
        { icon: Hash, label: 'Student ID', value: data.studentCode || '—', tone: 'bg-gray-100 text-gray-700' },
        {
          icon: GraduationCap,
          label: 'Major & Cohort',
          value: data.majorCode ? `${data.majorCode}${data.cohort ? ` · ${data.cohort}` : ''}` : 'Not set',
          tone: 'bg-orange-50 text-[#C2410C]',
        },
        { icon: BookOpen, label: 'Current Term', value: `Semester ${data.currentSemester}`, tone: 'bg-blue-50 text-blue-600' },
        {
          icon: Star,
          label: 'Current GPA',
          value: data.currentGpa !== null ? `${data.currentGpa.toFixed(2)} / 10` : 'No grades',
          tone: 'bg-amber-50 text-amber-700',
        },
        { icon: Wallet, label: 'Credits Earned', value: `${data.totalCreditsEarned} cr`, tone: 'bg-emerald-50 text-emerald-700' },
      ]
    : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-6">
      <ProfileHero
        fullName={identity?.fullName ?? user?.fullName}
        subtitle={`${data?.studentCode ? `${data.studentCode} · ` : ''}${identity?.email ?? user?.email ?? ''}`}
        roleBadge={data ? academicBadge.label : 'Student'}
        avatarUrl={identity?.avatarUrl ?? user?.avatarUrl}
        isLoading={identityQuery.isLoading}
      />

      {isError || identityQuery.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>Unable to load your profile.</span>
          <button
            type="button"
            onClick={() => {
              refetch();
              identityQuery.refetch();
            }}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : isLoading || identityQuery.isLoading || !data || !identity ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-18 animate-pulse rounded-xl bg-white shadow-2xs" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-2xs" />
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-2xs" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(({ icon: Icon, label, value, tone }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-3 shadow-2xs"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-gray-500">{label}</p>
                  <p className="truncate text-sm font-bold tabular-nums text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <PersonalInfoForm
                email={identity.email}
                dateOfBirth={identity.dateOfBirth}
                initialValues={{ fullName: identity.fullName, phone: identity.phone ?? '' }}
                editableEmailAndDob
                isSaving={save.isPending}
                onSave={(values) => save.mutate(values)}
              />
              <ChangePasswordCard authProvider={identity.authProvider} />
            </div>
            <div className="space-y-5">
              <MajorCurriculumCard profile={data} />
              <FlmPreferencesCard majorCode={data.majorCode} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
