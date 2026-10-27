import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { useAuth } from '../../auth/stores/useAuth';
import { advisorService } from '../services/advisorService';

export default function AdvisorProfile() {
  const qc = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const profile = useQuery({ queryKey: ['advisor', 'profile'], queryFn: advisorService.getProfile });
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { if (profile.data) setFullName(profile.data.fullName); }, [profile.data]);
  const update = useMutation({
    mutationFn: () => advisorService.updateProfile(fullName),
    onSuccess: async (result) => {
      if (user) setUser({ ...user, fullName: result.fullName });
      setMessage('Profile updated successfully.');
      await qc.invalidateQueries({ queryKey: ['advisor', 'profile'] });
    },
    onError: (error) => setMessage(apiMessage(error)),
  });

  if (profile.isLoading) return <p>Loading profile...</p>;
  if (profile.isError || !profile.data) return <p role="alert" className="text-red-700">Could not load your profile.</p>;
  const data = profile.data;
  return <div className="mx-auto max-w-3xl space-y-5">
    <header><p className="text-xs text-gray-500">Advisor / Profile</p>
      <h1 className="mt-1 text-2xl font-semibold">My Profile</h1>
      <p className="mt-1 text-sm text-gray-600">Update your display name and review your assignment information.</p></header>
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Full name
          <input className="mt-1 w-full rounded border p-2 font-normal" maxLength={255}
            value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
        <label className="text-sm font-medium">Email
          <input className="mt-1 w-full rounded border bg-gray-50 p-2 font-normal" value={data.email} readOnly /></label>
        <ReadOnly label="Status" value={data.status} />
        <ReadOnly label="Assignment start date" value={data.assignmentStartDate ?? 'Not assigned'} />
        <ReadOnly label="Active advisees" value={String(data.activeAdvisees)} />
        <ReadOnly label="Maximum advisees" value={String(data.maxAdvisees)} />
      </div>
      <button className="mt-5 rounded bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        disabled={update.isPending || !fullName.trim() || fullName.trim() === data.fullName}
        onClick={() => { setMessage(''); update.mutate(); }}>Save profile</button>
    </section>
    {message && <p role="status" className="rounded bg-white p-3 text-sm">{message}</p>}
  </div>;
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm font-medium">{label}</p>
    <p className="mt-1 rounded border bg-gray-50 p-2 text-sm">{value}</p></div>;
}
