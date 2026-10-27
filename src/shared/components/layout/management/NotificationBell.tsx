import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell } from 'lucide-react';
import {
  useAdminNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from '../../../../modules/management/hooks/queries/useAdminAssignments';
import { useAdminNotificationSocket } from '../../../../modules/notification/hooks/useAdminNotificationSocket';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 10;

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

/** Admin notifications, updated live over the WebSocket. A student asking for an advisor leads to the assignment screen. */
export function NotificationBell() {
  const navigate = useNavigate();
  const live = useAdminNotificationSocket();
  const [page, setPage] = useState(0);
  const { data } = useAdminNotifications(page, PAGE_SIZE);
  const { data: unread = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = data?.items ?? [];
  const total = data?.totalElements ?? 0;
  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  const openItem = (id: string, read: boolean, isAdvisorRequest: boolean) => {
    if (!read) markRead.mutate(id);
    setOpen(false);
    navigate(isAdvisorRequest ? '/admin/assignments?tab=unassigned&pending=1' : '/admin/assignments');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-[#555f6f] hover:bg-gray-100"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span
            data-testid="bell-badge"
            className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-bold leading-4 text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#151c27]">
              Notifications
              <span
                data-testid="live-indicator"
                title={live ? 'Live: new requests appear instantly' : 'Reconnecting... the list is reloaded when the connection is back'}
                className={cn('size-2 rounded-full', live ? 'bg-[#16a34a]' : 'bg-[#f59e0b]')}
              />
            </p>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button type="button" onClick={() => markAll.mutate()} disabled={markAll.isPending} className="text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60">
                  Mark all as read
                </button>
              )}
              <button type="button" onClick={() => { setOpen(false); navigate('/admin/assignments'); }} className="text-xs font-semibold text-[#555f6f] hover:underline">
                Assignments
              </button>
            </div>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#555f6f]">No notifications.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n.id, n.isRead, n.type === 'ADVISOR_REQUEST')}
                    className={cn('flex w-full flex-col gap-0.5 border-b border-[#f1f5f9] px-4 py-3 text-left hover:bg-gray-50', !n.isRead && 'bg-[#fff7ed]/60')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#151c27]">{n.title}</span>
                      <span className="shrink-0 text-[11px] text-[#98a2b3]">{ago(n.createdAt)}</span>
                    </span>
                    <span className="text-[13px] text-[#555f6f]">
                      {n.studentCode ? `${n.studentCode}: ` : ''}
                      {n.message}
                    </span>
                    {n.type === 'ADVISOR_REQUEST' && n.resolvedAt && <span className="text-[11px] font-semibold text-[#047857]">Resolved</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-[#e5e7eb] px-4 py-2 text-xs text-[#555f6f]">
              <span>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <span className="flex gap-3">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="font-semibold hover:underline disabled:opacity-40">
                  Newer
                </button>
                <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="font-semibold hover:underline disabled:opacity-40">
                  Older
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
