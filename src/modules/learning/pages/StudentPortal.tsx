// src/pages/learning/StudentPortal.tsx
// Dashboard Sinh viên: hồ sơ học tập, thông tin cố vấn phụ trách, danh sách thông báo.

import { useState } from 'react';
import { Link } from 'react-router';
import { BotMessageSquare, CalendarClock, MessageSquareText, Route } from 'lucide-react';
import { useAuth } from '../../auth/stores/useAuth';
import { useMyAdvisor, useMyProfile } from '../hooks/queries/useStudentQueries';
import { AdvisorInfoCard } from '../components/AdvisorInfoCard';
import { NotificationList } from '../components/NotificationList';
import { StudentProfileCard } from '../components/StudentProfileCard';


export default function StudentPortal() {
  const user = useAuth((s) => s.user);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileQuery = useMyProfile();
  const advisorQuery = useMyAdvisor();

  const displayName = profileQuery.data?.fullName || user?.fullName || 'Student';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Home</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Welcome, {displayName}</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          View your academic profile, assigned advisor, and latest notifications.
        </p>
      </div>



      {profileQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <span>{profileError ?? 'Unable to load your academic profile.'}</span>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Hồ sơ học tập */}
        {profileQuery.isLoading ? (
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </section>
        ) : profileQuery.data ? (
          <StudentProfileCard profile={profileQuery.data} />
        ) : null}

        {/* Cố vấn phụ trách */}
        <AdvisorInfoCard advisor={advisorQuery.data} />
      </div>

      {/* Thông báo */}
      <NotificationList />

      {/* Lối tắt */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/student/ai-chat"
          className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
              <BotMessageSquare className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#151c27]">Chat with AI</p>
              <p className="text-[13px] text-[#555f6f]">
                Ask about courses, academic policies, and study roadmaps.
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
        </Link>

        <Link
          to="/student/ai-roadmap"
          className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
              <Route className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#151c27]">Study Roadmap</p>
              <p className="text-[13px] text-[#555f6f]">An AI-generated semester-by-semester timeline.</p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
        </Link>

        <Link
          to="/student/advising-requests"
          className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
              <MessageSquareText className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#151c27]">Send Advising Request</p>
              <p className="text-[13px] text-[#555f6f]">
                Ask your advisor a question and track its status.
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
        </Link>

        <Link
          to="/student/appointments"
          className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#151c27]">Book Appointment</p>
              <p className="text-[13px] text-[#555f6f]">Choose a suitable available time slot.</p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
        </Link>
      </div>
    </div>
  );
}
