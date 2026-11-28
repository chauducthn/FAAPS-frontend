// Student advising requests: tickets go to a shared queue that any advisor can claim, shown as a board.

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, X } from '@phosphor-icons/react';
import { AdvisingRequestDetailModal } from '../components/AdvisingRequestDetailModal';
import { AdvisingRequestForm } from '../components/AdvisingRequestForm';
import { RequestBoard, RequestBoardError, RequestBoardSkeleton } from '../components/request-board/RequestBoard';
import { groupByColumn } from '../components/request-board/requestBoardModel';
import { useMyAdvisingRequests } from '../hooks/queries/useStudentQueries';
import { cn } from '@/shared/lib/utils';

export default function StudentAdvisingRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMyAdvisingRequests();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [queuedNotice, setQueuedNotice] = useState(false);

  const grouped = useMemo(() => groupByColumn(data ?? []), [data]);

  const onSubmitted = async () => {
    setQueuedNotice(true);
    setCreating(false);
    await queryClient.invalidateQueries({ queryKey: ['student', 'advising-requests'] });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#555f6f]">Student / Advising Requests</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advising Requests</h1>
          <p className="mt-1 text-sm text-[#555f6f]">
            Send your question to the queue — any available advisor can pick it up and help you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          aria-expanded={creating}
          aria-controls="advising-request-form"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#F26F21] px-3.5 text-sm font-bold text-white hover:bg-[#e05f14]"
        >
          {creating ? <X className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {creating ? 'Close form' : 'Create new request'}
        </button>
      </div>

      {queuedNotice && (
        <div
          role="status"
          className={cn(
            'flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5',
            'text-[13px] font-medium text-emerald-900',
          )}
        >
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your request has been sent to the queue. An advisor will get back to you as soon as possible.
        </div>
      )}

      {creating && (
        <section id="advising-request-form" className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <AdvisingRequestForm onSubmitted={onSubmitted} />
        </section>
      )}

      <section aria-label="Advising requests board">
        {isLoading ? (
          <RequestBoardSkeleton />
        ) : isError ? (
          <RequestBoardError onRetry={() => void refetch()} />
        ) : (
          <RequestBoard grouped={grouped} onOpen={setOpenId} />
        )}
      </section>

      <AdvisingRequestDetailModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
