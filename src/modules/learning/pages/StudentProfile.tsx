import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm, type PersonalInfoValues } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { apiMessage } from '@/shared/lib/apiMessage';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { useAuth } from '../../auth/stores/useAuth';
import { MajorCurriculumCard } from '../components/MajorCurriculumCard';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { useMyProfile } from '../hooks/queries/useStudentQueries';

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMyProfile();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: PersonalInfoValues) => {
    setSaving(true);
    try {
      const updated = await studentAcademicService.updateProfile({
        fullName: values.fullName,
        phone: values.phone,
      });
      if (user) {
        setUser({ ...user, fullName: updated.fullName ?? values.fullName });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['student', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'academic-profile'] }),
      ]);
      toast.success('Profile saved');
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-4">
      <ProfileHero
        fullName={data?.fullName ?? user?.fullName}
        subtitle={`Student${data?.studentCode ? ` · ${data.studentCode}` : ''}${data ? ` · ${data.email}` : ''}`}
        isLoading={isLoading}
      />

      {isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>Unable to load your profile.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : isLoading || !data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <PersonalInfoForm
              email={data.email}
              dateOfBirth={data.dateOfBirth}
              initialValues={{ fullName: data.fullName ?? '', phone: data.phone ?? '' }}
              isSaving={saving}
              onSave={handleSave}
            />
            <ChangePasswordCard />
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
