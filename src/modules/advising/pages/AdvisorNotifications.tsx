// src/modules/advising/pages/AdvisorNotifications.tsx
// Trang "Notifications" của Advisor — danh sách đầy đủ, lọc chưa đọc, phân trang.
//
// BE: GET /advisor/notifications?unreadOnly=&page=&size=
//     PATCH /advisor/notifications/{id}/read
//     PATCH /advisor/notifications/read-all
//
// Thiết kế: nền #FAFAFA, card #FFFFFF bo góc 16px, viền #E5E7EB, accent cam FPT #F37021.
// Click vào một item → đánh dấu đã đọc + điều hướng theo `actionUrl`.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
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
import { cn } from '@/shared/lib/utils';
import { Pagination } from '@/modules/management/components/Pagination';
import { useAdvisorNotificationList } from '../hooks/queries/useAdvisorQueries';
import {
  useMarkAdvisorNotificationRead,
  useMarkAllAdvisorNotificationsRead,
} from '../hooks/mutations/useAdvisingMutations';
import type { NotificationType, StudentNotification } from '../types/advising';

const PAGE_SIZE = 10;

/** Icon + nhãn + tone cho từng loại thông báo (khớp với chuông ở header). */
const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ADVISOR_REQUEST: { icon: UserPlus, label: 'Advising Request', tone: 'bg-[#fff7ed] text-[#f37021]' },
  MESSAGE: { icon: MessageSquare, label: 'Message', tone: 'bg-emerald-50 text-[#10B981]' },
  REMINDER: { icon: Clock, label: 'Reminder', tone: 'bg-amber-50 text-[#F59E0B]' },
  PLAN_STATUS: { icon: ClipboardCheck, label: 'Study Plan', tone: 'bg-[#f7f8fa] text-[#6B7280]' },
  WARNING: { icon: TriangleAlert, label: 'Warning', tone: 'bg-red-50 text-[#EF4444]' },
  INFO: { icon: Info, label: 'Information', tone: 'bg-[#f7f8fa] text-[#6B7280]' },
};

/** Thời gian tương đối: "5 min ago" → "3 h ago" → "12/05/2026". */
const relativeTime = (iso: string): string => {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function AdvisorNotifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const query = useAdvisorNotificationList({ unreadOnly, page, size: PAGE_SIZE });
  const markRead = useMarkAdvisorNotificationRead();
  const markAll = useMarkAllAdvisorNotificationsRead();

  const items: StudentNotification[] = query.data?.items ?? [];
  const total = query.data?.totalElements ?? 0;

  /** Đổi bộ lọc → luôn quay về trang 0 để không rơi vào trang không tồn tại. */
  const setFilter = (value: boolean) => {
    setUnreadOnly(value);
    setPage(0);
  };

  /** Click item → đánh dấu đã đọc (nếu chưa) rồi điều hướng theo actionUrl. */
  const handleOpen = (item: StudentNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.actionUrl?.startsWith('/advisor')) navigate(item.actionUrl);
  };

  return (
    <div className="w-full space-y-6 pb-4">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/advisor"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
            aria-label="Back to overview"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold text-[#1A1A1A]">
              <Bell className="size-5 text-[#f37021]" aria-hidden />
              Notifications
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Advising requests, appointments, study plan reviews and messages.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc unread / all */}
          <div className="inline-flex rounded-xl border border-[#E5E7EB] bg-white p-1">
            <button
              type="button"
              onClick={() => setFilter(false)}
              aria-pressed={!unreadOnly}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                !unreadOnly
                  ? 'bg-[#f37021] text-white'
                  : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]',
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter(true)}
              aria-pressed={unreadOnly}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                unreadOnly
                  ? 'bg-[#f37021] text-white'
                  : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]',
              )}
            >
              Unread
            </button>
          </div>

          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || total === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all as read
          </button>
        </div>
      </div>

      {/* ── Danh sách ── */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {query.isLoading ? (
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
        ) : query.isError ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-red-50 text-[#EF4444]">
              <TriangleAlert className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-[#1A1A1A]">Unable to load notifications</p>
            <p className="text-[13px] text-[#6B7280]">An error occurred while loading data.</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-1 rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
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
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {items.map((item) => {
              const meta = NOTIFICATION_META[item.notificationType] ?? NOTIFICATION_META.INFO;
              const Icon = meta.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(item)}
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]',
                      !item.isRead && 'bg-[#fff7ed]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl',
                        meta.tone,
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={cn(
                            'text-sm text-[#1A1A1A]',
                            item.isRead ? 'font-medium' : 'font-semibold',
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="rounded-full bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                          {meta.label}
                        </span>
                        {!item.isRead && (
                          <span className="size-1.5 rounded-full bg-[#f37021]" aria-label="Unread" />
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">{item.message}</p>
                    </div>

                    <span className="shrink-0 pt-1 text-[11px] text-[#6B7280]">{relativeTime(item.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {total > PAGE_SIZE && (
          <div className="border-t border-[#E5E7EB]">
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

      <p className="text-[12px] text-[#6B7280]">
        {unreadOnly
          ? `${total} unread notification${total === 1 ? '' : 's'}.`
          : `${total} notification${total === 1 ? '' : 's'} in total.`}
      </p>
    </div>
  );
}
