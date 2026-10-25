// src/components/layout/student/StudentNotificationBell.tsx
// Chuông thông báo dành cho sinh viên — badge đếm số thông báo chưa đọc.
// Dựng theo mẫu src/components/layout/admin/NotificationBell.tsx.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell } from 'lucide-react';
import {
  useStudentNotifications,
  useUnreadStudentNotificationCount,
} from '../../../hooks/queries/useStudentQueries';
import {
  useMarkAllStudentNotificationsRead,
  useMarkStudentNotificationRead,
} from '../../../hooks/mutations/useAdvisingMutations';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 8;

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} phút trước`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} giờ trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export function StudentNotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useStudentNotifications(0, PAGE_SIZE);
  const { data: unreadData } = useUnreadStudentNotificationCount();
  const markRead = useMarkStudentNotificationRead();
  const markAll = useMarkAllStudentNotificationsRead();

  const unread = unreadData?.totalElements ?? 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = data?.items ?? [];

  const openItem = (id: string, isRead: boolean, actionUrl: string | null) => {
    if (!isRead) markRead.mutate(id);
    setOpen(false);
    if (actionUrl) navigate(actionUrl);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-[#555f6f] hover:bg-gray-100"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span
            data-testid="student-bell-badge"
            className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-bold leading-4 text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] px-4 py-3">
            <p className="text-sm font-semibold text-[#151c27]">Thông báo</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#555f6f]">Chưa có thông báo.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n.id, n.isRead, n.actionUrl)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 border-b border-[#f1f5f9] px-4 py-3 text-left hover:bg-gray-50',
                      !n.isRead && 'bg-[#fff7ed]/60',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-[13px] text-[#151c27]',
                          n.isRead ? 'font-medium' : 'font-semibold',
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#98a2b3]">{ago(n.createdAt)}</span>
                    </span>
                    <span className="text-[13px] text-[#555f6f]">{n.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
