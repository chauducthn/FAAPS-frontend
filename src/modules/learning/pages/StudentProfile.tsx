// Student / Profile: personal information (name and phone are editable) and the read-only academic profile.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { useMyProfile } from '../hooks/queries/useStudentQueries';
import { profileSchema, type ProfileFormValues } from '../validations/profile.schema';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { useAuth } from '../../auth/stores/useAuth';

/** "2004-05-20" -> "20/05/2004". */
const formatDate = (value?: string | null) => {
  if (!value) return 'Not provided';
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#555f6f]">{label}</p>
      <p className="mt-1 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2 text-sm text-[#151c27]">{value}</p>
    </div>
  );
}

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMyProfile();
  const user = useAuth((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (data) reset({ fullName: data.fullName, phone: data.phone ?? '' });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await studentAcademicService.updateProfile({ fullName: values.fullName, phone: values.phone });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['student', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'academic-profile'] }),
      ]);
      toast.success('Profile saved');
    } catch (error) {
      toast.error(apiMessage(error));
    }
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Profile</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">My Profile</h1>
        <p className="mt-1 text-sm text-[#555f6f]">Keep your contact details up to date. Academic data is managed by the university.</p>
      </div>

      {isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
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
          <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm" />
          <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-[#F26F21]">
                {(data.fullName || user?.fullName || 'S').trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[#151c27]">{data.fullName}</h2>
                <p className="truncate text-[13px] text-[#555f6f]">{data.email}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-4">
              <div>
                <label htmlFor="profile-fullName" className="text-xs font-semibold text-[#555f6f]">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-fullName"
                  maxLength={255}
                  aria-invalid={!!errors.fullName}
                  className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none focus:border-[#F26F21] aria-[invalid=true]:border-red-400"
                  {...register('fullName')}
                />
                {errors.fullName && <p className="mt-1 text-[12px] text-red-600">{errors.fullName.message}</p>}
              </div>

              <div>
                <label htmlFor="profile-phone" className="text-xs font-semibold text-[#555f6f]">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  maxLength={20}
                  placeholder="0901234567"
                  aria-invalid={!!errors.phone}
                  className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] aria-[invalid=true]:border-red-400"
                  {...register('phone')}
                />
                {errors.phone && <p className="mt-1 text-[12px] text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Email" value={data.email} />
                <ReadOnlyField label="Date of birth" value={formatDate(data.dateOfBirth)} />
              </div>
              <p className="-mt-2 text-[12px] text-[#98a2b3]">Email and date of birth cannot be changed here. Contact the Academic Office to correct them.</p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!isDirty || isSubmitting}
                  onClick={() => reset({ fullName: data.fullName, phone: data.phone ?? '' })}
                  className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50 disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          <StudentProfileCard profile={data} />
        </div>
      )}
    </div>
  );
}
