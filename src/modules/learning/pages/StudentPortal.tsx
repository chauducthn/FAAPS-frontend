import { Link } from 'react-router';
import {
  Robot as BotMessageSquare,
  CalendarDot as CalendarClock,
  ChatCircleText as MessageSquareText,
  Path as Route,
} from '@phosphor-icons/react';
import { useAuth } from '../../auth/stores/useAuth';
import { useIdentityProfile } from '@/shared/hooks/useIdentityProfile';
import {
  useMyAdvisingRequests,
  useMyAdvisor,
  useMyAppointments,
  useMyProfile,
  useMyProgress,
} from '../hooks/queries/useStudentQueries';
import { AdvisorInfoCard } from '../components/AdvisorInfoCard';
import { ProgressSummary } from '../components/ProgressSummary';
import { RecentRequestsCard } from '../components/RecentRequestsCard';
import { UpcomingAppointmentCard } from '../components/UpcomingAppointmentCard';

export default function StudentPortal() {
  const user = useAuth((s) => s.user);
  const profileQuery = useMyProfile();
  const advisorQuery = useMyAdvisor();
  const progressQuery = useMyProgress();
  const appointmentsQuery = useMyAppointments();
  const requestsQuery = useMyAdvisingRequests();
  const displayName = useIdentityProfile().data?.fullName || user?.fullName || 'Student';
  const profile = profileQuery.data;

  const quickActions = [
    { to: '/student/ai-chat', label: 'AI Chat', icon: BotMessageSquare, primary: true },
    { to: '/student/ai-roadmap', label: 'Roadmap', icon: Route, primary: false },
    { to: '/student/appointments', label: 'Book Slot', icon: CalendarClock, primary: false },
    { to: '/student/advising-requests', label: 'Ask Advisor', icon: MessageSquareText, primary: false },
  ];

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Welcome back, {displayName}
            </h1>
            {profile?.studentCode && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200/80">
                {profile.studentCode}
                {profile.majorCode ? ` · ${profile.majorCode}` : ''}
                {profile.cohort ? ` ${profile.cohort}` : ''}
                {profile.currentSemester ? ` · Sem ${profile.currentSemester}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map(({ to, label, icon: Icon, primary }) => (
            <Link
              key={to}
              to={to}
              className={
                primary
                  ? 'inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14]'
                  : 'inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]'
              }
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {profile && !profile.curriculumVersionId && (
        <div
          role="note"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900"
        >
          <span>Choose your major &amp; curriculum in My Profile to unlock your progress and study plan.</span>
          <Link to="/student/profile" className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e05f14]">
            Go to Profile
          </Link>
        </div>
      )}

      {profileQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
          <span>Unable to load your academic profile.</span>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      <ProgressSummary progress={progressQuery.data} isLoading={progressQuery.isLoading} />

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <AdvisorInfoCard advisor={advisorQuery.data} />
        <UpcomingAppointmentCard appointments={appointmentsQuery.data} isLoading={appointmentsQuery.isLoading} />
        <RecentRequestsCard requests={requestsQuery.data} isLoading={requestsQuery.isLoading} />
      </div>
    </div>
  );
}
