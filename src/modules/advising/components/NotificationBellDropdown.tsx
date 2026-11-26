// Dropdown panel for AdvisorNotificationBell.

import {
  Bell,
  Checks as CheckCheck,
  ClipboardText as ClipboardCheck,
  Clock,
  Info,
  ChatCircle as MessageSquare,
  Warning as TriangleAlert,
  UserPlus,
  type Icon as LucideIcon,
} from '@phosphor-icons/react';
import { ADVISOR_NOTIFICATION_POLL_MS } from '../hooks/queries/useAdvisorQueries';
import type { NotificationType, StudentNotification } from '../types/advising';
import { cn } from '@/shared/lib/utils';

const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-[#fff7ed] text-[#f37021]' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-emerald-50 text-[#10B981]' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-50 text-[#F59E0B]' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-[#f7f8fa] text-[#555f6f]' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-50 text-[#EF4444]' },
  INFO: { icon: Info, label: 'Information', tone: 'bg-[#f7f8fa] text-[#555f6f]' },
};

interface NotificationBellDropdownProps {
  items: StudentNotification[];
  unread: number;
  markAllPending: boolean;
  onMarkAll: () => void;
  onSelect: (item: StudentNotification) => void;
  onViewAll: () => void;
  formatTime: (iso: string) => string;
}

export function NotificationBellDropdown({
  items,
  unread,
  markAllPending,
  onMarkAll,
  onSelect,
  onViewAll,
  formatTime,
}: NotificationBellDropdownProps) {
  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className={cn(
        'absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden',
        'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
          Notifications
          {unread > 0 && (
            <span
              className={cn(
                'rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold text-[#f37021]',
                'ring-1 ring-inset ring-[#f37021]/20',
              )}
            >
              {unread} new
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onMarkAll}
          disabled={markAllPending || unread === 0}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#f37021] transition-colors hover:bg-[#fff7ed] disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#f7f8fa] text-[#6B7280]">
            <Bell className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-[#1A1A1A]">No notifications yet</p>
          <p className="max-w-xs text-[13px] text-[#6B7280]">
            New advising requests, appointments, and messages will appear here.
          </p>
        </div>
      ) : (
        <ul className="max-h-96 divide-y divide-[#f1f5f9] overflow-y-auto">
          {items.map((item) => {
            const meta = NOTIFICATION_META[item.notificationType] ?? NOTIFICATION_META.INFO;
            const Icon = meta.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA]',
                    !item.isRead && 'bg-[#fff7ed]',
                  )}
                >
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', meta.tone)}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          'text-[13px] text-[#1A1A1A]',
                          item.isRead ? 'font-medium' : 'font-semibold',
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="rounded-full bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                        {meta.label}
                      </span>
                      {!item.isRead && (
                        <span className="size-1.5 rounded-full bg-[#f37021]" aria-label="Unread" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-[#6B7280]">
                      {item.message}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-[#6B7280]">{formatTime(item.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
        <span className="text-[11px] text-[#6B7280]">Updates every {ADVISOR_NOTIFICATION_POLL_MS / 1000}s</span>
        <button
          type="button"
          onClick={onViewAll}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px]',
            'font-semibold text-[#f37021] transition-colors hover:bg-[#fff7ed]',
          )}
        >
          View all
          <CheckCheck className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
