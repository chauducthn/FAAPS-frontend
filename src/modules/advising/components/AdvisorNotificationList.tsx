// Notification list states and rows for AdvisorNotifications page.

import {
  Bell,
  ClipboardText as ClipboardCheck,
  Clock,
  Info,
  ChatCircle as MessageSquare,
  Warning as TriangleAlert,
  UserPlus,
  type Icon as LucideIcon,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { relativeTime } from './AdvisorNotificationBell';
import type { NotificationType, StudentNotification } from '../types/advising';

const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-[#fff7ed] text-[#f37021]' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-emerald-50 text-[#10B981]' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-50 text-[#F59E0B]' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-[#f7f8fa] text-[#6B7280]' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-50 text-[#EF4444]' },
  INFO: { icon: Info, label: 'Information', tone: 'bg-[#f7f8fa] text-[#6B7280]' },
};

interface AdvisorNotificationListProps {
  items: StudentNotification[];
  isLoading: boolean;
  isError: boolean;
  unreadOnly: boolean;
  onRetry: () => void;
  onOpen: (item: StudentNotification) => void;
}

export function AdvisorNotificationList({
  items,
  isLoading,
  isError,
  unreadOnly,
  onRetry,
  onOpen,
}: AdvisorNotificationListProps) {
  if (isLoading) {
    return (
      <ul className="divide-y divide-[#f1f5f9]">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex animate-pulse gap-3 px-5 py-4">
            <span className="size-9 shrink-0 rounded-xl bg-[#f7f8fa]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-[#f7f8fa]" />
              <div className="h-3 w-3/4 rounded bg-[#f7f8fa]" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-red-50 text-[#EF4444]">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-[#1A1A1A]">Unable to load notifications</p>
        <p className="text-[13px] text-[#6B7280]">An error occurred while loading data.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f7f8fa] text-[#6B7280]">
          <Bell className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-[#1A1A1A]">
          {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
        </p>
        <p className="max-w-md text-[13px] text-[#6B7280]">
          {unreadOnly
            ? 'You have read every notification. Switch to “All” to see the full history.'
            : 'Notifications about advising requests, appointments, and study plan reviews will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#f1f5f9]">
      {items.map((item) => {
        const meta = NOTIFICATION_META[item.notificationType] ?? NOTIFICATION_META.INFO;
        const Icon = meta.icon;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className={cn(
                'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]',
                !item.isRead && 'bg-[#fff7ed]',
              )}
            >
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', meta.tone)}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn('text-sm text-[#1A1A1A]', item.isRead ? 'font-medium' : 'font-semibold')}>
                    {item.title}
                  </span>
                  <span className="rounded-full bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                    {meta.label}
                  </span>
                  {!item.isRead && <span className="size-1.5 rounded-full bg-[#f37021]" aria-label="Unread" />}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">{item.message}</p>
              </div>
              <span className="shrink-0 pt-1 text-[11px] text-[#6B7280]">{relativeTime(item.createdAt)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
