// src/modules/advising/components/AdvisorNotificationBell.tsx
// Chuông thông báo cho Advisor — nằm ở góc phải header, cạnh avatar.
//
// BE chưa có WebSocket cho advisor ⇒ poll mỗi 30s (xem ADVISOR_NOTIFICATION_POLL_MS).
// Dropdown hiển thị 5 thông báo mới nhất; "View all" dẫn tới /advisor/notifications.
//
// Thiết kế: nền #FAFAFA, card #FFFFFF, chữ #1A1A1A / #6B7280, viền #E5E7EB,
// accent cam FPT #F37021. Bo góc 16px cho dropdown, 12px cho button.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  CheckCheck,
  ClipboardCheck,
  Clock,
  Info,
  MessageSquare,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import {
  ADVISOR_NOTIFICATION_POLL_MS,
  useAdvisorNotifications,
  useUnreadAdvisorNotificationCount,
} from '../hooks/queries/useAdvisorQueries';
import {
  useMarkAdvisorNotificationRead,
  useMarkAllAdvisorNotificationsRead,
} from '../hooks/mutations/useAdvisingMutations';
import { advisorRequestLink, ticketIdFromActionUrl } from '../utils/ticketLink';
import type { NotificationType, StudentNotification } from '../types/advising';
import { cn } from '@/shared/lib/utils';

/** Icon + nhãn + tone cho từng loại thông báo. */
const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-[#fff7ed] text-[#f37021]' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-emerald-50 text-[#10B981]' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-50 text-[#F59E0B]' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-[#f7f8fa] text-[#555f6f]' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-50 text-[#EF4444]' },
  INFO: { icon: Info, label: 'Information', tone: 'bg-[#f7f8fa] text-[#555f6f]' },
};

/** Thời gian tương đối: "5 min ago" → "3 h ago" → "12/05". */
export const relativeTime = (iso: string): string => {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function AdvisorNotificationBell() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { data } = useAdvisorNotifications();
  const { data: unread = 0 } = useUnreadAdvisorNotificationCount();
  const markRead = useMarkAdvisorNotificationRead();
  const markAll = useMarkAllAdvisorNotificationsRead();

  // Đóng dropdown khi click ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) =>
      ref.current && !ref.current.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items: StudentNotification[] = data?.items ?? [];

  /**
   * Click a notification → mark it as read, then navigate.
   *
   * When the notification points at an advising ticket, the URL is rewritten to
   * `/advisor/advising-requests?id=<ticketId>` so the ticket list opens that
   * ticket's modal straight away.
   */
  const select = (item: StudentNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    setOpen(false);
    if (!item.actionUrl?.startsWith('/advisor')) return;

    const ticketId = ticketIdFromActionUrl(item.actionUrl);
    navigate(ticketId ? advisorRequestLink(ticketId) : item.actionUrl);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Notifications"
        className="relative cursor-pointer rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#f7f8fa] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span
            data-testid="advisor-bell-badge"
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
              Notifications
              {unread > 0 && (
                <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold text-[#f37021] ring-1 ring-inset ring-[#f37021]/20">
                  {unread} new
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending || unread === 0}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-[#f37021] transition-colors hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-50"
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
                      onClick={() => select(item)}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA]',
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
                      <span className="shrink-0 pt-0.5 text-[11px] text-[#6B7280]">{relativeTime(item.createdAt)}</span>
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
              onClick={() => {
                setOpen(false);
                navigate('/advisor/notifications');
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold text-[#f37021] transition-colors hover:bg-[#fff7ed]"
            >
              View all
              <CheckCheck className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
