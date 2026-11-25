import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ChangePasswordCard } from '@/shared/components/profile/ChangePasswordCard';
import { PersonalInfoForm, type PersonalInfoValues } from '@/shared/components/profile/PersonalInfoForm';
import { ProfileHero } from '@/shared/components/profile/ProfileHero';
import { apiMessage } from '@/shared/lib/apiMessage';
import { useAuth } from '../../auth/stores/useAuth';
import { AdvisorWorkloadCard } from '../components/AdvisorWorkloadCard';
import { advisorService } from '../services/advisorService';

export default function AdvisorProfile() {
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);

  const profile = useQuery({
    queryKey: ['advisor', 'profile'],
    queryFn: advisorService.getProfile,
  });

  const update = useMutation({
    mutationFn: (values: PersonalInfoValues) =>
      advisorService.updateProfile({
        fullName: values.fullName,
        phone: values.phone || null,
        specialization: values.specialization || null,
      }),
    onSuccess: async (result) => {
      if (user) {
        setUser({ ...user, fullName: result.fullName });
      }
      await queryClient.invalidateQueries({ queryKey: ['advisor', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => toast.error(apiMessage(error)),
  });

  const data = profile.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-4">
      <ProfileHero
        fullName={data?.fullName ?? user?.fullName}
        subtitle={`Academic Advisor${data ? ` · ${data.email}` : ''}`}
        isLoading={profile.isLoading}
        action={
          <Link
            to="/advisor/students"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-[#c2410c] shadow-sm hover:bg-orange-50"
          >
            My Students <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      {profile.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          Could not load your profile.{' '}
          <button type="button" onClick={() => profile.refetch()} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : profile.isLoading || !data ? (
        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <AdvisorWorkloadCard profile={data} />
          <div className="space-y-5">
            <PersonalInfoForm
              email={data.email}
              showSpecialization
              initialValues={{
                fullName: data.fullName,
                phone: data.phone ?? '',
                specialization: data.specialization ?? '',
              }}
              isSaving={update.isPending}
              onSave={(values) => {
                update.mutate(values);
              }}
            />
            <ChangePasswordCard />
          </div>
        </div>
      )}
    </div>
  );
}
