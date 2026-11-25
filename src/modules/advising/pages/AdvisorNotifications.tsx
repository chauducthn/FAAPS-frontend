// Advisor notifications page with unread filter and pagination.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '@/modules/management/components/Pagination';
import { useAdvisorNotificationList } from '../hooks/queries/useAdvisorQueries';
import {
  useMarkAdvisorNotificationRead,
  useMarkAllAdvisorNotificationsRead,
} from '../hooks/mutations/useAdvisingMutations';
import type { StudentNotification } from '../types/advising';
import { AdvisorNotificationList } from '../components/AdvisorNotificationList';

const PAGE_SIZE = 10;

export default function AdvisorNotifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const query = useAdvisorNotificationList({ unreadOnly, page, size: PAGE_SIZE });
  const markRead = useMarkAdvisorNotificationRead();
  const markAll = useMarkAllAdvisorNotificationsRead();

  const items: StudentNotification[] = query.data?.items ?? [];
  const total = query.data?.totalElements ?? 0;

  const setFilter = (value: boolean) => {
    setUnreadOnly(value);
    setPage(0);
  };

  const handleOpen = (item: StudentNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.actionUrl?.startsWith('/advisor')) navigate(item.actionUrl);
  };

  return (
    <div className="w-full space-y-6 pb-4">
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
          <div className="inline-flex rounded-xl border border-[#E5E7EB] bg-white p-1">
            <button
              type="button"
              onClick={() => setFilter(false)}
              aria-pressed={!unreadOnly}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                !unreadOnly ? 'bg-[#f37021] text-white' : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]',
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
                unreadOnly ? 'bg-[#f37021] text-white' : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]',
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

      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <AdvisorNotificationList
          items={items}
          isLoading={query.isLoading}
          isError={query.isError}
          unreadOnly={unreadOnly}
          onRetry={() => query.refetch()}
          onOpen={handleOpen}
        />

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
