import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { studentAcademicService } from '../../services/studentAcademicService';

export default function StudentOverview() {
  const profile = useQuery({ queryKey: ['student', 'academic-profile'], queryFn: studentAcademicService.profile });
  const assignment = useQuery({ queryKey: ['student', 'assignment'], queryFn: studentAcademicService.assignment });
  if (profile.isLoading) return <p>Loading your account...</p>;
  if (profile.isError) return <p role="alert" className="text-red-700">Could not load your account.</p>;
  const p = profile.data;
  return <div className="grid gap-4 md:grid-cols-3">
    <section className="rounded-xl bg-white p-5 shadow-sm md:col-span-2">
      <h2 className="text-lg font-semibold">Welcome, {p?.fullName}</h2>
      {p?.studentCode ? <p className="mt-2 text-sm text-gray-600">{p.studentCode} · {p.majorName ?? 'Major not assigned'} · {p.cohort ?? 'Cohort not assigned'}</p>
        : <p className="mt-2 text-sm text-amber-700">Your academic profile has not been assigned yet. Your account is ready; transcript and curriculum data will appear after assignment.</p>}
      <div className="mt-4 flex flex-wrap gap-2"><Link className="text-orange-700 underline" to="/student/transcript">View transcript</Link><Link className="text-orange-700 underline" to="/student/plans">Open study plans</Link></div>
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Academic advisor</h2>
      {assignment.isLoading ? <p className="mt-2 text-sm">Loading...</p> : assignment.isError ? <p role="alert" className="mt-2 text-sm text-red-700">Could not load advisor status.</p>
        : <p className="mt-2 text-sm text-gray-600">{assignment.data?.advisorId ? 'Advisor assigned' : assignment.data?.pendingRequestId ? 'Assignment request pending' : 'No advisor assigned'}</p>}
      <Link className="mt-3 inline-block text-sm text-orange-700 underline" to="/student/advising">Open advising</Link>
    </section>
  </div>;
}
