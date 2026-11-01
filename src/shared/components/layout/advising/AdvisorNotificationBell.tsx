import { Bell, ClipboardCheck, Clock, Info, MessageSquare, TriangleAlert, UserPlus, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  useAdvisorNotifications,
  useUnreadAdvisorNotificationCount,
} from '@/modules/advising/hooks/queries/useAdvisorQueries';
import {
  useMarkAdvisorNotificationRead,
  useMarkAllAdvisorNotificationsRead,
} from '@/modules/advising/hooks/mutations/useAdvisingMutations';
import type { NotificationType } from '@/modules/advising/types/advising';
import { cn } from '@/shared/lib/utils';

/** Đồng bộ 1-1 với NotificationList (student) — cùng icon, tone, label. */
const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-orange-100 text-orange-700' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-green-100 text-green-700' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-100 text-amber-700' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-purple-100 text-purple-700' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-100 text-red-700' },
  INFO: { icon: Info, label: 'Information', tone: 'bg-blue-100 text-blue-700' },
};

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
};

export function AdvisorNotificationBell() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data } = useAdvisorNotifications();
  const { data: unread = 0 } = useUnreadAdvisorNotificationCount();
  const markRead = useMarkAdvisorNotificationRead();
  const markAll = useMarkAllAdvisorNotificationsRead();

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
  }, [open ]);

  const items = data?.items ?? [];

  const select = (id: string, isRead: boolean, actionUrl: string | null) => {
    if (!isRead) markRead.mutate(id);
    setOpen(false);
    if (actionUrl?.startsWith('/advisor')) navigate(actionUrl);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-[#555f6f] transition-colors hover:bg-gray-100"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span
            data-testid="advisor-bell-badge"
            className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-bold leading-4 text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] px-4 py-3">
            <p className="text-sm font-semibold text-[#151c27]">
              Notifications
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold text-[#c2410c] ring-1 ring-inset ring-orange-200">
                  {unread} new
                </span>
              )}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60"
              >
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[#98a2b3]">
                <Bell className="size-5" />
              </span>
              <p className="text-sm font-semibold text-[#151c27]">No notifications yet</p>
              <p className="max-w-xs text-[13px] text-[#555f6f]">
                New advising requests, appointments, and messages will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-[#f1f5f9] overflow-y-auto">
              {items.map((item) => {
                const meta = NOTIFICATION_META[item.notificationType] ?? NOTIFICATION_META.INFO;
                const Icon = meta.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => select(item.id, item.isRead, item.actionUrl)}
                      className={cn(
                        'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50',
                        !item.isRead && 'bg-[#fff7ed]',
                      )}
                    >
                      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', meta.tone)}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={cn('text-[13px] text-[#151c27]', item.isRead ? 'font-medium' : 'font-semibold')}>
                            {item.title}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[#555f6f]">
                            {meta.label}
                          </span>
                          {!item.isRead && <span className="size-1.5 rounded-full bg-[#F26F21]" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-[#555f6f]">
                          {item.message}
                        </span>
                      </span>
                      <span className="shrink-0 pt-0.5 text-[11px] text-[#98a2b3]">{ago(item.createdAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
