// src/pages/advisor/AdvisorPortal.tsx
import { Link } from 'react-router';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../../stores/useAuth';

export default function AdvisorPortal() {
  const user = useAuth((s) => s.user);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Advisor / Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-[#555f6f]">Advisor ticket management and advising support</p>
      </div>

      <Link
        to="/advisor/appointments"
        className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#151c27]">My weekly appointments</p>
            <p className="text-[13px] text-[#555f6f]">Review pending requests and manage your schedule.</p>
          </div>
        </div>
        <span className="text-[13px] font-semibold text-[#F26F21]">Open</span>
      </Link>
    </div>
  );
}
