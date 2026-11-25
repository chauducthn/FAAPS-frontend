// src/modules/learning/pages/AdvisingRequests.tsx
// The student's "Advising Requests" page — a TICKET (helpdesk) system, NOT a 1-1
// chat with an assigned advisor.
//
// Flow:
//   Student submits → the ticket joins the shared queue (PENDING) → any advisor may claim it.
//   An advisor claims → IN_PROGRESS, the student can chat with the advisor holding the ticket.
//   The advisor finishes → RESOLVED, the ticket is closed.
//
// So there is NO "assigned advisor" logic on the student side: the student can submit
// right away, and the chat box only opens once an advisor has claimed the ticket.
//
// Layout: a Kanban-style board with one column per ticket state, mirroring the
// language of the study-plan board (StudentStudyPlan.tsx) — white columns, an
// orange header per column, and cards that lift on hover.

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CircleAlert,
  Clock3,
  Inbox,
  LifeBuoy,
  MessageSquareText,
  Plus,
  TicketCheck,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AdvisingRequestDetailModal } from '../components/AdvisingRequestDetailModal';
import { AdvisingRequestForm } from '../components/AdvisingRequestForm';
import { useMyAdvisingRequests } from '../hooks/queries/useStudentQueries';
import type {
  AdvisingRequest,
  AdvisingRequestStatus,
} from '../../advising/types/advising';

/* ---------- Column model ---------- */

type ColumnKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

interface Column {
  key: ColumnKey;
  title: string;
  hint: string;
  icon: typeof Inbox;
  /** Header tone: the accent bar + header background. */
  headerClass: string;
  iconClass: string;
  emptyIcon: typeof Inbox;
}

const COLUMNS: Column[] = [
  {
    key: 'PENDING',
    title: 'Pending',
    hint: 'Waiting for an advisor to claim',
    icon: Inbox,
    headerClass: 'border-amber-200 bg-amber-50/80',
    iconClass: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    emptyIcon: Clock3,
  },
  {
    key: 'IN_PROGRESS',
    title: 'In Progress',
    hint: 'An advisor is handling it',
    icon: LifeBuoy,
    headerClass: 'border-blue-200 bg-blue-50/80',
    iconClass: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
    emptyIcon: MessageSquareText,
  },
  {
    key: 'RESOLVED',
    title: 'Resolved',
    hint: 'Handled and closed',
    icon: TicketCheck,
    headerClass: 'border-emerald-200 bg-emerald-50/80',
    iconClass: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    emptyIcon: TicketCheck,
  },
];

/* ---------- Relative time (English) ---------- */

/** "just now" → "5 min ago" → "3 h ago" → "2 days ago" → "Nov 26, 2026". */
function relativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/** "Advisor Nguyễn Văn A" → "NA" for the avatar. */
function initialsOf(name: string | null | undefined): string {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Status badge tone per state (Yellow / Blue / Green). */
const STATUS_TONES: Record<AdvisingRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300',
  RESOLVED: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300',
};

const STATUS_LABELS: Record<AdvisingRequestStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};

/* ---------- Page ---------- */

export default function StudentAdvisingRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMyAdvisingRequests();
  const requests = data ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  /** Mở/đóng form tạo yêu cầu mới. */
  const [creating, setCreating] = useState(false);

  /** Shown right after the student submits a request. */
  const [queuedNotice, setQueuedNotice] = useState(false);

  // The form reports success → show the "sent to the queue" notice and close the form.
  const onSubmitted = async () => {
    setQueuedNotice(true);
    setCreating(false);
    await queryClient.invalidateQueries({ queryKey: ['student', 'advising-requests'] });
  };

  /** Group tickets by state. CANCELLED (cancelled by the student) lands in "Resolved". */
  const grouped = useMemo(() => {
    const buckets: Record<ColumnKey, AdvisingRequest[]> = {
      PENDING: [],
      IN_PROGRESS: [],
      RESOLVED: [],
    };
    for (const request of requests) {
      if (request.status === 'PENDING') buckets.PENDING.push(request);
      else if (request.status === 'IN_PROGRESS') buckets.IN_PROGRESS.push(request);
      else buckets.RESOLVED.push(request);
    }
    for (const key of Object.keys(buckets) as ColumnKey[]) {
      buckets[key].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return buckets;
  }, [requests]);

  return (
    <div className="w-full space-y-5">
      {/* ── Hero: title + "Create New Request" button ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-6 text-white shadow-[0_4px_16px_rgba(242,111,33,0.28)] sm:px-7 sm:py-7">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/12" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-40 size-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <LifeBuoy className="size-7" aria-hidden strokeWidth={2.25} />
              Advising Requests
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              Send your question to the queue — any available advisor can pick it up and
              help you.
            </p>
          </div>

          {/* "Create New Request" — FPT orange, top-right */}
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            aria-expanded={creating}
            aria-controls="advising-request-form"
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98] sm:self-center"
          >
            {creating ? (
              <>
                <X className="size-4" aria-hidden />
                Close Form
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                Create New Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notice shown after a successful submission */}
      {queuedNotice && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-[13px] font-medium text-emerald-900"
        >
          <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Your request has been sent to the queue. An advisor will get back to you as
            soon as possible.
          </span>
        </div>
      )}

      {/* ── Create-request form (collapsible) ── */}
      {creating && (
        <section
          id="advising-request-form"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <AdvisingRequestForm onSubmitted={onSubmitted} />
        </section>
      )}

      {/* ── Board: 3 columns by state ── */}
      <section aria-label="Advising requests board" className="space-y-4">
        {isLoading ? (
          <BoardSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-[#151c27]">Could not load your requests</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#555f6f]">
                The advising requests failed to load. Check your connection, then try
                again — the requests you sent are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#151c27] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {COLUMNS.map((column) => {
              const items = grouped[column.key];
              const EmptyIcon = column.emptyIcon;
              return (
                <section
                  key={column.key}
                  aria-label={column.title}
                  className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                >
                  {/* Header cột: tiêu đề + badge đếm số lượng */}
                  <header
                    className={cn(
                      'flex items-center justify-between gap-3 border-b px-4 py-3.5',
                      column.headerClass,
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-xl',
                          column.iconClass,
                        )}
                      >
                        <column.icon className="size-4" aria-hidden strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-extrabold tracking-tight text-[#151c27]">
                          {column.title}
                        </h2>
                        <p className="truncate text-[11px] font-medium text-[#555f6f]">
                          {column.hint}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-[#151c27] shadow-xs ring-1 ring-slate-200">
                      {items.length}
                    </span>
                  </header>

                  {/* Column body: the ticket cards */}
                  <div className="flex flex-1 flex-col gap-3 bg-[#FAFAFA] p-3.5">
                    {items.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 px-4 py-12 text-center">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <EmptyIcon className="size-5" aria-hidden />
                        </span>
                        <p className="text-[13px] font-bold text-[#555f6f]">No requests yet</p>
                        <p className="max-w-[220px] text-[12px] leading-relaxed text-slate-400">
                          {column.key === 'PENDING'
                            ? 'Requests you send will appear here while they wait for an advisor.'
                            : column.key === 'IN_PROGRESS'
                              ? 'Once an advisor claims your request, the conversation shows up here.'
                              : 'Finished requests are archived here.'}
                        </p>
                      </div>
                    ) : (
                      items.map((request) => (
                        <TicketCard
                          key={request.id}
                          request={request}
                          onOpen={() => setOpenId(request.id)}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      <AdvisingRequestDetailModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

/* ---------- Card một ticket ---------- */

function TicketCard({
  request,
  onOpen,
}: {
  request: AdvisingRequest;
  onOpen: () => void;
}) {
  const closed = request.status === 'RESOLVED' || request.status === 'CANCELLED';

  return (
    <article
      className={cn(
        'group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4',
        'shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_10px_24px_rgba(16,24,40,0.12)]',
        'focus-within:border-orange-300 focus-within:shadow-[0_10px_24px_rgba(16,24,40,0.12)]',
      )}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        {/* Tiêu đề + badge trạng thái */}
        <div className="flex items-start justify-between gap-2.5">
          <h3
            className="min-w-0 flex-1 break-words text-[14px] font-extrabold leading-snug tracking-tight text-[#151c27] transition-colors group-hover:text-[#c2410c]"
            title={request.title}
          >
            {request.title}
          </h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
              STATUS_TONES[request.status] ?? STATUS_TONES.PENDING,
            )}
          >
            {STATUS_LABELS[request.status] ?? STATUS_LABELS.PENDING}
          </span>
        </div>

        {/* Mô tả ngắn — cắt bớt ở 2 dòng */}
        {request.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#555f6f]">
            {request.description}
          </p>
        )}

        {/* Kết quả xử lý — chỉ hiện khi ticket đã đóng */}
        {closed && request.resolutionSummary && (
          <p className="mt-3 line-clamp-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] leading-relaxed text-emerald-900">
            {request.resolutionSummary}
          </p>
        )}

        {/* Chân card: thời gian tạo + cố vấn đang phụ trách */}
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Clock3 className="size-3.5 shrink-0" aria-hidden />
            <time dateTime={request.createdAt}>{relativeTime(request.createdAt)}</time>
          </span>

          {request.advisorName ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F26F21] text-[10px] font-extrabold text-white"
              >
                {initialsOf(request.advisorName)}
              </span>
              <span
                className="truncate text-[11px] font-bold text-[#555f6f]"
                title={request.advisorName}
              >
                {request.advisorName}
              </span>
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <UserRound className="size-3.5" aria-hidden />
              No advisor yet
            </span>
          )}
        </div>
      </button>
    </article>
  );
}

/* ---------- Skeleton ---------- */

function BoardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-label="Loading advising requests">
      {[0, 1, 2].map((column) => (
        <div
          key={column}
          className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3.5">
            <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="h-6 w-8 animate-pulse rounded-lg bg-slate-200/70" />
          </div>
          <div className="flex flex-1 flex-col gap-3 bg-[#FAFAFA] p-3.5">
            {[0, 1].map((card) => (
              <div
                key={card}
                className="rounded-2xl border border-slate-200 bg-white p-4"
                style={{ animationDelay: `${(column * 2 + card) * 70}ms` }}
              >
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2.5 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
