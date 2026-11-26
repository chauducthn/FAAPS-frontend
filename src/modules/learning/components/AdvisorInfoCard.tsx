import { Link } from 'react-router';
import {
  CalendarDot as CalendarClock,
  EnvelopeSimple as Mail,
  ChatCircleText as MessageSquareText,
  Phone,
  User as UserRound,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisorInfo } from '@/modules/advising/types/advising';

const STATUS_STYLES: Record<AdvisorInfo['status'], { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  INACTIVE: { label: 'Inactive', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  ON_LEAVE: { label: 'On leave', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
};

export function AdvisorInfoCard({ advisor }: { advisor: AdvisorInfo | null | undefined }) {
  if (!advisor) {
    return (
      <section className="flex h-full flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-gray-900">Assigned Advisor</h2>
        <div className="my-auto flex flex-col items-center gap-2 py-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <UserRound className="size-5" />
          </span>
          <p className="text-sm font-semibold text-gray-900">No advisor assigned yet</p>
          <p className="text-xs text-gray-500">Your assigned advisor will appear here once configured.</p>
        </div>
      </section>
    );
  }

  const status = STATUS_STYLES[advisor.status] ?? STATUS_STYLES.INACTIVE;

  return (
    <section className="flex h-full flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-900">Assigned Advisor</h2>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-base font-bold text-[#C2410C] ring-1 ring-orange-200/80">
            {advisor.fullName?.charAt(0).toUpperCase() ?? 'A'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{advisor.fullName}</p>
            <p className="truncate text-xs text-gray-500">{advisor.advisorCode}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-gray-100 pt-3.5 text-xs text-gray-600">
          <p className="flex items-center gap-2 truncate">
            <Mail className="size-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{advisor.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0 text-gray-400" />
            <span>{advisor.phone ?? 'No phone'}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3.5">
        <Link
          to="/student/advising-requests"
          className="inline-flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#F26F21] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14]"
        >
          <MessageSquareText className="size-3.5" /> Request
        </Link>
        <Link
          to="/student/appointments"
          className="inline-flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <CalendarClock className="size-3.5" /> Book
        </Link>
      </div>
    </section>
  );
}
