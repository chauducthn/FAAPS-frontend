// src/pages/student/StudentPortal.tsx
// Dashboard Sinh viên: hồ sơ học tập, thông tin cố vấn phụ trách, danh sách thông báo.

import { useState } from 'react';
import { Link } from 'react-router';
import { BotMessageSquare, CalendarClock, MessageSquareText, Route } from 'lucide-react';
import { useAuth } from '../../stores/useAuth';
import { useMyAdvisor, useMyProfile } from '../../hooks/queries/useStudentQueries';
import { AdvisorInfoCard } from '../../components/student/AdvisorInfoCard';
import { NotificationList } from '../../components/student/NotificationList';
import { StudentProfileCard } from '../../components/student/StudentProfileCard';


export default function StudentPortal() {
  const user = useAuth((s) => s.user);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileQuery = useMyProfile();
  const advisorQuery = useMyAdvisor();

  const displayName = profileQuery.data?.fullName || user?.fullName || 'bạn';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Sinh viên / Trang chủ</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Xin chào, {displayName}</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Tổng quan hồ sơ học tập, cố vấn phụ trách và thông báo mới nhất của bạn.
        </p>
      </div>



      {profileQuery.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <span>{profileError ?? 'Không tải được hồ sơ học tập.'}</span>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-100"
          >
            Thử lại
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
              <p className="text-sm font-semibold text-[#151c27]">Chat với AI</p>
              <p className="text-[13px] text-[#555f6f]">
                Hỏi về môn học, quy chế và lộ trình học tập.
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Mở</span>
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
              <p className="text-sm font-semibold text-[#151c27]">Lộ trình học</p>
              <p className="text-[13px] text-[#555f6f]">Timeline từng học kỳ do AI sinh.</p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Mở</span>
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
              <p className="text-sm font-semibold text-[#151c27]">Gửi yêu cầu tư vấn</p>
              <p className="text-[13px] text-[#555f6f]">
                Gửi câu hỏi cho cố vấn và theo dõi trạng thái xử lý.
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Mở</span>
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
              <p className="text-sm font-semibold text-[#151c27]">Đặt lịch hẹn</p>
              <p className="text-[13px] text-[#555f6f]">Chọn khung giờ trống phù hợp.</p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#F26F21]">Mở</span>
        </Link>
      </div>
    </div>
  );
}
