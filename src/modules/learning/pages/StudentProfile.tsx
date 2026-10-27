import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { apiMessage } from '../../../shared/lib/apiMessage';

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['student', 'academic-profile'], queryFn: studentAcademicService.profile });
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) { setFullName(data.fullName); setPhone(data.phone ?? ''); } }, [data]);
  if (isLoading) return <p>Loading profile...</p>;
  if (isError || !data) return <p role="alert" className="text-red-700">Could not load profile.</p>;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage('');
    try { await studentAcademicService.updateProfile({ fullName, phone }); await queryClient.invalidateQueries({ queryKey: ['student', 'academic-profile'] }); setMessage('Profile saved.'); }
    catch (error) { setMessage(apiMessage(error)); }
    finally { setSaving(false); }
  };
  return <section className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold">Personal profile</h2>
    <p className="mt-2 text-sm text-gray-600">Email: {data.email}</p>
    <p className="text-sm text-gray-600">Student code: {data.studentCode ?? 'Not assigned'}</p>
    <p className="text-sm text-gray-600">Major: {data.majorName ?? 'Not assigned'}</p>
    <p className="text-sm text-gray-600">Cohort: {data.cohort ?? 'Not assigned'}</p>
    <form onSubmit={save} className="mt-5 space-y-4">
      <label className="block text-sm font-medium">Full name<input className="mt-1 w-full rounded border p-2" maxLength={255} required value={fullName} onChange={(e) => setFullName(e.target.value)} /></label>
      <label className="block text-sm font-medium">Phone<input className="mt-1 w-full rounded border p-2" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <button disabled={saving} className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save profile'}</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </section>;
}
