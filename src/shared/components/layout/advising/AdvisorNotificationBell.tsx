import { Bell } from 'lucide-react';
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
import { cn } from '@/shared/lib/utils';

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
    const close = (event: MouseEvent) =>
      ref.current && !ref.current.contains(event.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const select = (id: string, isRead: boolean, actionUrl: string | null) => {
    if (!isRead) markRead.mutate(id);
    setOpen(false);
    if (actionUrl?.startsWith('/advisor')) navigate(actionUrl);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative rounded-lg p-2 text-[#555f6f] hover:bg-gray-100">
        <Bell className="size-5" />
        {unread > 0 && <span data-testid="advisor-bell-badge"
          className="absolute right-0 top-0 min-w-4 rounded-full bg-red-700 px-1 text-[10px] font-bold leading-4 text-white">
          {unread > 9 ? '9+' : unread}
        </span>}
      </button>
      {open && <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && <button type="button" onClick={() => markAll.mutate()}
            className="text-xs font-semibold text-orange-600">Mark all as read</button>}
        </div>
        {(data?.items ?? []).length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet.</p> :
          <ul className="max-h-80 overflow-y-auto">{data!.items.map((item) =>
            <li key={item.id}><button type="button" onClick={() => select(item.id, item.isRead, item.actionUrl)}
              className={cn('w-full border-b px-4 py-3 text-left hover:bg-gray-50', !item.isRead && 'bg-orange-50')}>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-gray-600">{item.message}</p>
            </button></li>)}</ul>}
      </div>}
    </div>
  );
}
