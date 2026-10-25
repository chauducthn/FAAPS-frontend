// src/pages/student/StudentPortal.tsx
import { Link } from 'react-router';
import { CalendarClock } from 'lucide-react';
import { useAuth } from '../../stores/useAuth';

export default function StudentPortal() {
  const user = useAuth((s) => s.user);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-[#555f6f]">Student transcript and study roadmap</p>
      </div>

      <Link
        to="/student/appointments"
        className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
            <CalendarClock className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#151c27]">Book an advisor appointment</p>
            <p className="text-[13px] text-[#555f6f]">Choose a free 30-minute slot that suits you.</p>
          </div>
        </div>
        <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
      </Link>
    </div>
  );
}
