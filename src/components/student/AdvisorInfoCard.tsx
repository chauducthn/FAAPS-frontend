// src/components/student/AdvisorInfoCard.tsx
// Card thông tin cố vấn phụ trách của sinh viên.
// Nguồn dữ liệu: advisors + users + student_advisor_assignments (is_primary = true).

import { Link } from 'react-router';
import {
  Briefcase,
  CalendarClock,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ISO_WEEKDAY_LABELS } from '@/lib/appointmentDate';
import type { AdvisorInfo } from '@/types/advising';

const STATUS_STYLES: Record<AdvisorInfo['status'], { label: string; className: string }> = {
  ACTIVE: { label: 'Đang hoạt động', className: 'bg-green-100 text-green-800 ring-green-200' },
  INACTIVE: { label: 'Ngừng hoạt động', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  ON_LEAVE: { label: 'Đang nghỉ phép', className: 'bg-amber-100 text-amber-800 ring-amber-200' },
};

/** "1,2,3,4,5" (ISO weekday) → "Mon, Tue, Wed, Thu, Fri". */
const formatWorkDays = (workDays: string | null) => {
  if (!workDays) return 'Chưa cập nhật';
  const days = workDays
    .split(',')
    .map((d) => Number(d.trim()))
    .filter((d) => d >= 1 && d <= 7)
    .map((d) => ISO_WEEKDAY_LABELS[d - 1]);
  return days.length > 0 ? days.join(', ') : 'Chưa cập nhật';
};

/** "2024-09-01" → "01/09/2024". */
const formatDate = (value: string | null) => {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

function AdvisorAvatar({ advisor }: { advisor: AdvisorInfo }) {
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700 ring-1 ring-[#e5e7eb]">
      {advisor.fullName?.charAt(0).toUpperCase() ?? 'C'}
    </span>
  );
}

function AdvisorRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#98a2b3]" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#98a2b3]">{label}</p>
        <p className="truncate text-[13px] font-medium text-[#151c27]">{value}</p>
      </div>
    </div>
  );
}

/** Card cố vấn phụ trách. Khi chưa được phân công cố vấn → hiện empty state. */
export function AdvisorInfoCard({ advisor }: { advisor: AdvisorInfo | null | undefined }) {
  if (!advisor) {
    return (
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#151c27]">Cố vấn phụ trách</h2>
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#e5e7eb] px-4 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[#98a2b3]">
            <UserRound className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">Bạn chưa được phân công cố vấn</p>
          <p className="max-w-md text-[13px] text-[#555f6f]">
            Vui lòng liên hệ Phòng Đào tạo hoặc quản trị viên hệ thống để được phân công cố vấn
            phụ trách. Sau khi được phân công, thông tin cố vấn sẽ hiển thị tại đây.
          </p>
        </div>
      </section>
    );
  }

  const status = STATUS_STYLES[advisor.status] ?? STATUS_STYLES.INACTIVE;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#151c27]">Cố vấn phụ trách</h2>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <AdvisorAvatar advisor={advisor} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#151c27]">{advisor.fullName}</p>
          <p className="text-[13px] text-[#555f6f]">Mã cố vấn: {advisor.advisorCode}</p>
          {advisor.groupName && (
            <p className="mt-0.5 text-[13px] text-[#555f6f]">Nhóm: {advisor.groupName}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3.5 border-t border-[#f1f5f9] pt-4 sm:grid-cols-2">
        <AdvisorRow icon={Mail} label="Email" value={advisor.email} />
        <AdvisorRow
          icon={Phone}
          label="Điện thoại"
          value={advisor.phone ?? 'Chưa cập nhật'}
        />
        <AdvisorRow
          icon={Briefcase}
          label="Chuyên môn"
          value={advisor.specialization ?? 'Chưa cập nhật'}
        />
        <AdvisorRow icon={CalendarClock} label="Ngày làm việc" value={formatWorkDays(advisor.workDays)} />
        <AdvisorRow icon={Users} label="Số SV tối đa" value={`${advisor.maxAdvisees} sinh viên`} />
        <AdvisorRow
          icon={UserRound}
          label="Ngày phân công"
          value={formatDate(advisor.assignedDate ?? advisor.assignmentStartDate)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f1f5f9] pt-4">
        <Link
          to="/student/advising-requests"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14]"
        >
          <MessageSquareText className="size-4" />
          Gửi yêu cầu tư vấn
        </Link>
        <Link
          to="/student/appointments"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#555f6f] transition-colors hover:bg-gray-50"
        >
          <CalendarClock className="size-4" />
          Đặt lịch hẹn
        </Link>
      </div>
    </section>
  );
}
