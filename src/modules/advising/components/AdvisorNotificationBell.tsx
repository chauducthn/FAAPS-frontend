// Advisor notification bell positioned in the top-right header next to the avatar.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell } from 'lucide-react';
import {
  useAdvisorNotifications,
  useUnreadAdvisorNotificationCount,
} from '../hooks/queries/useAdvisorQueries';
import {
  useMarkAdvisorNotificationRead,
  useMarkAllAdvisorNotificationsRead,
} from '../hooks/mutations/useAdvisingMutations';
import type { StudentNotification } from '../types/advising';
import { NotificationBellDropdown } from './NotificationBellDropdown';

/** Relative time label: "5 min ago" -> "3 h ago" -> "12/05/2026". */
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

  const select = (item: StudentNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    setOpen(false);
    if (item.actionUrl?.startsWith('/advisor')) navigate(item.actionUrl);
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
        className="relative rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#f7f8fa] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40"
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
        <NotificationBellDropdown
          items={items}
          unread={unread}
          markAllPending={markAll.isPending}
          onMarkAll={() => markAll.mutate()}
          onSelect={select}
          onViewAll={() => {
            setOpen(false);
            navigate('/advisor/notifications');
          }}
          formatTime={relativeTime}
        />
      )}
    </div>
  );
}
