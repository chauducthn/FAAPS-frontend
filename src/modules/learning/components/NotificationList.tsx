// src/components/learning/NotificationList.tsx
// Danh sách thông báo của sinh viên — có phân trang, đánh dấu đã đọc, điều hướng theo actionUrl.

import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardCheck,
  Clock,
  Info,
  MessageSquare,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '@/modules/management/components/Pagination';
import { useStudentNotifications } from '../hooks/queries/useStudentQueries';
import {
  useMarkAllStudentNotificationsRead,
  useMarkStudentNotificationRead,
} from '../../advising/hooks/mutations/useAdvisingMutations';
import type { NotificationType } from '../../advising/types/advising';

const PAGE_SIZE = 5;

const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  INFO: { icon: Info, label: 'Information', tone: 'bg-blue-100 text-blue-700' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-100 text-red-700' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-100 text-amber-700' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-purple-100 text-purple-700' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-green-100 text-green-700' },
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-orange-100 text-orange-700' },
};

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} minute(s) ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hour(s) ago`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export function NotificationList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isError, refetch } = useStudentNotifications(page, PAGE_SIZE, unreadOnly);
  const markRead = useMarkStudentNotificationRead();
  const markAll = useMarkAllStudentNotificationsRead();

  const items = data?.items ?? [];
  const total = data?.totalElements ?? 0;

  const handleOpen = (id: string, isRead: boolean, actionUrl: string | null) => {
    if (!isRead) markRead.mutate(id);
    if (actionUrl) navigate(actionUrl);
  };

  return (
    <section className="flex flex-col rounded-xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#151c27]">Notifications</h2>
          <button
            type="button"
            onClick={() => {
              setUnreadOnly((v) => !v);
              setPage(0);
            }}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset transition-colors',
              unreadOnly
                ? 'bg-orange-100 text-orange-800 ring-orange-200'
                : 'bg-gray-100 text-[#555f6f] ring-gray-200 hover:bg-gray-200',
            )}
          >
            {unreadOnly ? 'Unread only' : 'All'}
          </button>
        </div>
        {total > 0 && (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-[13px] font-semibold text-orange-600 hover:underline disabled:opacity-60"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <ul className="divide-y divide-[#f1f5f9]">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex animate-pulse gap-3 px-5 py-4">
              <span className="size-8 shrink-0 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load notifications</p>
          <p className="text-[13px] text-[#555f6f]">An error occurred while loading data.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[#98a2b3]">
            <Info className="size-5" />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">
            {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="max-w-md text-[13px] text-[#555f6f]">
            Notifications about study plans, advising requests, and appointments will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f1f5f9]">
          {items.map((n) => {
            const meta = NOTIFICATION_META[n.notificationType] ?? NOTIFICATION_META.INFO;
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(n.id, n.isRead, n.actionUrl)}
                  className={cn(
                    'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50',
                    !n.isRead && 'bg-[#fff7ed]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full',
                      meta.tone,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          'text-[13px] text-[#151c27]',
                          n.isRead ? 'font-medium' : 'font-semibold',
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[#555f6f]">
                        {meta.label}
                      </span>
                      {!n.isRead && (
                        <span className="size-1.5 rounded-full bg-[#F26F21]" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#555f6f]">{n.message}</p>
                  </div>
                  <span className="shrink-0 pt-0.5 text-[11px] text-[#98a2b3]">{ago(n.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {total > PAGE_SIZE && (
        <div className="border-t border-[#f1f5f9]">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            noun="notifications"
            onChange={setPage}
            bare
          />
        </div>
      )}
    </section>
  );
}
